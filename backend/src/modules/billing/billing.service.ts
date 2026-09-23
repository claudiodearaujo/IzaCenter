import Stripe from 'stripe';
import { SaasSubscriptionStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { stripe } from '../../config/stripe';
import { AppError, Errors } from '../../middlewares/error.middleware';
import {
  SaasPlanKey,
  findPlanByPriceId,
  getPublicSaasPlans,
  getSaasPlan,
} from './billing.catalog';

export class BillingService {
  getPlans() {
    return {
      billingEnabled: env.SAAS_BILLING_ENABLED,
      plans: getPublicSaasPlans(),
    };
  }

  async getCurrent(tenantId: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        planKey: true,
      },
    });

    if (!tenant) {
      throw Errors.NotFound('Tenant');
    }

    const subscription = await this.ensureSubscription(tenant.id, tenant.planKey);
    const plan = getSaasPlan(tenant.planKey) || getSaasPlan('starter')!;

    return {
      billingEnabled: env.SAAS_BILLING_ENABLED,
      plan: {
        key: plan.key,
        name: plan.name,
        description: plan.description,
        monthlyPriceCents: plan.monthlyPriceCents,
        currency: plan.currency,
        entitlements: plan.entitlements,
      },
      subscription: {
        status: subscription.status,
        planKey: subscription.planKey,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        trialEndsAt: subscription.trialEndsAt,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        canceledAt: subscription.canceledAt,
        hasBillingCustomer: Boolean(subscription.providerCustomerId),
      },
      plans: getPublicSaasPlans(),
    };
  }

  async createCheckout(tenantId: string, planKey: string) {
    if (!env.SAAS_BILLING_ENABLED) {
      throw new AppError(
        'Cobrança SaaS ainda não está habilitada neste ambiente',
        503,
        'SAAS_BILLING_DISABLED'
      );
    }

    const plan = getSaasPlan(planKey);
    if (!plan) {
      throw Errors.BadRequest('Plano SaaS inválido');
    }
    if (plan.key === 'starter') {
      throw Errors.BadRequest('O plano Starter não requer checkout');
    }
    if (!plan.priceId) {
      throw new AppError(
        'O preço Stripe deste plano ainda não foi configurado',
        503,
        'SAAS_PRICE_NOT_CONFIGURED'
      );
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, name: true, planKey: true },
    });
    if (!tenant) {
      throw Errors.NotFound('Tenant');
    }

    const owner = await prisma.tenantMembership.findFirst({
      where: {
        tenantId,
        role: 'OWNER',
        isActive: true,
      },
      include: {
        user: {
          select: {
            email: true,
            fullName: true,
          },
        },
      },
    });

    if (!owner) {
      throw Errors.BadRequest('Tenant sem owner ativo para cobrança');
    }

    const subscription = await this.ensureSubscription(tenantId, tenant.planKey);
    let customerId = subscription.providerCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: owner.user.email,
        name: tenant.name,
        metadata: {
          billingKind: 'saas',
          tenantId,
          ownerName: owner.user.fullName,
        },
      });
      customerId = customer.id;

      await prisma.saasSubscription.update({
        where: { tenantId },
        data: { providerCustomerId: customerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: `${env.FRONTEND_URL}/admin/assinatura?billing=success`,
      cancel_url: `${env.FRONTEND_URL}/admin/assinatura?billing=cancelled`,
      client_reference_id: tenantId,
      metadata: {
        billingKind: 'saas',
        tenantId,
        planKey: plan.key,
      },
      subscription_data: {
        metadata: {
          billingKind: 'saas',
          tenantId,
          planKey: plan.key,
        },
      },
      locale: 'pt-BR',
      allow_promotion_codes: false,
    });

    return {
      checkoutUrl: session.url,
      sessionId: session.id,
    };
  }

  async createPortal(tenantId: string) {
    if (!env.SAAS_BILLING_ENABLED) {
      throw new AppError(
        'Cobrança SaaS ainda não está habilitada neste ambiente',
        503,
        'SAAS_BILLING_DISABLED'
      );
    }

    const subscription = await this.ensureSubscription(tenantId);
    if (!subscription.providerCustomerId) {
      throw new AppError(
        'Este tenant ainda não possui cliente de cobrança SaaS',
        409,
        'SAAS_BILLING_CUSTOMER_MISSING'
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.providerCustomerId,
      return_url: `${env.FRONTEND_URL}/admin/assinatura`,
    });

    return { portalUrl: session.url };
  }

  async syncSubscription(subscription: Stripe.Subscription) {
    const raw = subscription as any;
    const providerSubscriptionId = subscription.id;
    const existing = await prisma.saasSubscription.findUnique({
      where: { providerSubscriptionId },
    });

    const metadataTenantId = subscription.metadata?.tenantId;
    const tenantId = metadataTenantId || existing?.tenantId;
    if (!tenantId) {
      console.warn(
        `SaaS subscription ${providerSubscriptionId} ignored: tenantId not found`
      );
      return null;
    }

    const priceId =
      raw.items?.data?.[0]?.price?.id ||
      existing?.providerPriceId ||
      null;

    const metadataPlan = subscription.metadata?.planKey;
    const configuredPlan =
      (metadataPlan && getSaasPlan(metadataPlan)) ||
      findPlanByPriceId(priceId) ||
      (existing?.planKey ? getSaasPlan(existing.planKey) : null) ||
      getSaasPlan('starter')!;

    const status = this.mapStripeStatus(subscription.status);
    const customerId =
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer?.id || null;

    const currentPeriodStart =
      raw.current_period_start ||
      raw.items?.data?.[0]?.current_period_start ||
      null;
    const currentPeriodEnd =
      raw.current_period_end ||
      raw.items?.data?.[0]?.current_period_end ||
      null;

    const saved = await prisma.$transaction(async (tx) => {
      const persisted = await tx.saasSubscription.upsert({
        where: { tenantId },
        create: {
          tenantId,
          planKey: configuredPlan.key,
          status,
          provider: 'stripe',
          providerCustomerId: customerId,
          providerSubscriptionId,
          providerPriceId: priceId,
          currentPeriodStart: this.fromUnix(currentPeriodStart),
          currentPeriodEnd: this.fromUnix(currentPeriodEnd),
          trialEndsAt: this.fromUnix(raw.trial_end),
          cancelAtPeriodEnd: Boolean(raw.cancel_at_period_end),
          canceledAt: this.fromUnix(raw.canceled_at),
        },
        update: {
          planKey: configuredPlan.key,
          status,
          providerCustomerId: customerId,
          providerSubscriptionId,
          providerPriceId: priceId,
          currentPeriodStart: this.fromUnix(currentPeriodStart),
          currentPeriodEnd: this.fromUnix(currentPeriodEnd),
          trialEndsAt: this.fromUnix(raw.trial_end),
          cancelAtPeriodEnd: Boolean(raw.cancel_at_period_end),
          canceledAt: this.fromUnix(raw.canceled_at),
        },
      });

      if (status === 'ACTIVE' || status === 'TRIALING') {
        await tx.tenant.update({
          where: { id: tenantId },
          data: { planKey: configuredPlan.key },
        });
      } else if (status === 'CANCELED' || status === 'UNPAID') {
        await tx.tenant.update({
          where: { id: tenantId },
          data: { planKey: 'starter' },
        });
      }

      return persisted;
    });

    return saved;
  }

  async syncSubscriptionById(providerSubscriptionId: string) {
    const subscription = await stripe.subscriptions.retrieve(providerSubscriptionId);
    return this.syncSubscription(subscription);
  }

  async beginStripeEvent(stripeEventId: string, eventType: string) {
    const existing = await prisma.stripeWebhookEvent.findUnique({
      where: { stripeEventId },
      select: { processedAt: true },
    });

    if (existing?.processedAt) {
      return false;
    }

    await prisma.stripeWebhookEvent.upsert({
      where: { stripeEventId },
      create: {
        stripeEventId,
        eventType,
      },
      update: {
        eventType,
        lastError: null,
      },
    });

    return true;
  }

  async markStripeEventProcessed(stripeEventId: string, tenantId?: string | null) {
    await prisma.stripeWebhookEvent.update({
      where: { stripeEventId },
      data: {
        processedAt: new Date(),
        lastError: null,
        ...(tenantId ? { tenantId } : {}),
      },
    });
  }

  async markStripeEventFailed(stripeEventId: string, error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    await prisma.stripeWebhookEvent.update({
      where: { stripeEventId },
      data: {
        lastError: message.slice(0, 1000),
      },
    });
  }

  private async ensureSubscription(tenantId: string, fallbackPlanKey = 'starter') {
    return prisma.saasSubscription.upsert({
      where: { tenantId },
      create: {
        tenantId,
        planKey: fallbackPlanKey || 'starter',
        status: fallbackPlanKey === 'starter' ? 'FREE' : 'ACTIVE',
      },
      update: {},
    });
  }

  private mapStripeStatus(status: Stripe.Subscription.Status): SaasSubscriptionStatus {
    switch (status) {
      case 'trialing':
        return 'TRIALING';
      case 'active':
        return 'ACTIVE';
      case 'past_due':
        return 'PAST_DUE';
      case 'paused':
        return 'PAUSED';
      case 'canceled':
      case 'incomplete_expired':
        return 'CANCELED';
      case 'incomplete':
        return 'INCOMPLETE';
      case 'unpaid':
        return 'UNPAID';
      default:
        return 'INCOMPLETE';
    }
  }

  private fromUnix(value?: number | null): Date | null {
    return value ? new Date(value * 1000) : null;
  }
}

export const billingService = new BillingService();
