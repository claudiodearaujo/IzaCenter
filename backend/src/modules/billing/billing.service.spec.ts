import '../../test/mocks/stripe.mock';
import { BillingService } from './billing.service';
import { prismaMock } from '../../test/mocks/prisma.mock';

describe('BillingService', () => {
  let service: BillingService;

  beforeEach(() => {
    service = new BillingService();
    jest.clearAllMocks();
    (prismaMock.$transaction as jest.Mock).mockImplementation(
      async (callback: any) => callback(prismaMock)
    );
  });

  it('returns the starter plan and entitlements for the current tenant', async () => {
    prismaMock.tenant.findUnique.mockResolvedValue({
      id: 'tenant-1',
      planKey: 'starter',
    } as any);
    prismaMock.saasSubscription.upsert.mockResolvedValue({
      id: 'sub-free',
      tenantId: 'tenant-1',
      planKey: 'starter',
      status: 'FREE',
      providerCustomerId: null,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      trialEndsAt: null,
      cancelAtPeriodEnd: false,
      canceledAt: null,
    } as any);

    const result = await service.getCurrent('tenant-1');

    expect(result.plan.key).toBe('starter');
    expect(result.plan.entitlements.branding).toBe(true);
    expect(result.subscription.status).toBe('FREE');
    expect(result.subscription.hasBillingCustomer).toBe(false);
  });

  it('does not expose Stripe price ids in the public catalog', () => {
    const result = service.getPlans();

    expect(result.plans.map((plan) => plan.key)).toEqual([
      'starter',
      'professional',
      'studio',
    ]);
    expect(result.plans[1]).not.toHaveProperty('priceId');
  });

  it('rejects checkout when SaaS billing is disabled', async () => {
    await expect(
      service.createCheckout('tenant-1', 'professional')
    ).rejects.toMatchObject({
      statusCode: 503,
      code: 'SAAS_BILLING_DISABLED',
    });
  });

  it('promotes tenant plan only after an active Stripe subscription event', async () => {
    prismaMock.saasSubscription.findUnique.mockResolvedValue(null);
    prismaMock.saasSubscription.upsert.mockResolvedValue({
      id: 'sub-local',
      tenantId: 'tenant-1',
      planKey: 'professional',
      status: 'ACTIVE',
    } as any);
    prismaMock.tenant.update.mockResolvedValue({ id: 'tenant-1' } as any);

    await service.syncSubscription({
      id: 'sub_stripe_1',
      status: 'active',
      customer: 'cus_1',
      metadata: {
        tenantId: 'tenant-1',
        planKey: 'professional',
      },
      items: {
        data: [
          {
            price: { id: 'price_professional' },
            current_period_start: 1_790_000_000,
            current_period_end: 1_792_592_000,
          },
        ],
      },
      cancel_at_period_end: false,
      trial_end: null,
      canceled_at: null,
    } as any);

    expect(prismaMock.tenant.update).toHaveBeenCalledWith({
      where: { id: 'tenant-1' },
      data: { planKey: 'professional' },
    });
  });

  it('downgrades tenant to starter when Stripe subscription is canceled', async () => {
    prismaMock.saasSubscription.findUnique.mockResolvedValue({
      tenantId: 'tenant-1',
      planKey: 'professional',
      providerPriceId: 'price_professional',
    } as any);
    prismaMock.saasSubscription.upsert.mockResolvedValue({
      id: 'sub-local',
      tenantId: 'tenant-1',
      planKey: 'professional',
      status: 'CANCELED',
    } as any);
    prismaMock.tenant.update.mockResolvedValue({ id: 'tenant-1' } as any);

    await service.syncSubscription({
      id: 'sub_stripe_1',
      status: 'canceled',
      customer: 'cus_1',
      metadata: {
        tenantId: 'tenant-1',
        planKey: 'professional',
      },
      items: { data: [{ price: { id: 'price_professional' } }] },
      cancel_at_period_end: false,
      trial_end: null,
      canceled_at: 1_790_000_000,
    } as any);

    expect(prismaMock.tenant.update).toHaveBeenCalledWith({
      where: { id: 'tenant-1' },
      data: { planKey: 'starter' },
    });
  });

  it('deduplicates a Stripe event already marked as processed', async () => {
    prismaMock.stripeWebhookEvent.findUnique.mockResolvedValue({
      processedAt: new Date(),
    } as any);

    const shouldProcess = await service.beginStripeEvent(
      'evt_already_done',
      'checkout.session.completed'
    );

    expect(shouldProcess).toBe(false);
    expect(prismaMock.stripeWebhookEvent.upsert).not.toHaveBeenCalled();
  });

  it('registers an unprocessed Stripe event for durable idempotency', async () => {
    prismaMock.stripeWebhookEvent.findUnique.mockResolvedValue(null);
    prismaMock.stripeWebhookEvent.upsert.mockResolvedValue({
      id: 'event-local',
      stripeEventId: 'evt_new',
    } as any);

    const shouldProcess = await service.beginStripeEvent(
      'evt_new',
      'customer.subscription.updated'
    );

    expect(shouldProcess).toBe(true);
    expect(prismaMock.stripeWebhookEvent.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { stripeEventId: 'evt_new' },
      })
    );
  });
});
