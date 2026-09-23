import { Router, Request, Response } from 'express';
import express from 'express';
import Stripe from 'stripe';
import { stripeHelpers } from '../../config/stripe';
import { ordersService } from '../orders/orders.service';
import { billingService } from '../billing/billing.service';

const router = Router();

function invoiceSubscriptionId(invoice: any): string | null {
  const direct = invoice.subscription;
  if (typeof direct === 'string') return direct;
  if (direct?.id) return direct.id;

  const parentSubscription = invoice.parent?.subscription_details?.subscription;
  if (typeof parentSubscription === 'string') return parentSubscription;
  if (parentSubscription?.id) return parentSubscription.id;

  return null;
}

/**
 * Stripe webhook shared by two independent domains:
 * - commerce: clients paying a tenant for services/products;
 * - SaaS billing: tenant paying the platform subscription.
 *
 * The event id is persisted before processing and marked processed only after
 * successful handling. A failed event remains retryable after process restart.
 */
router.post(
  '/',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;

    try {
      event = stripeHelpers.constructEvent(req.body, signature);
    } catch (error: any) {
      console.error('Stripe webhook signature verification failed:', error.message);
      res.status(400).send(`Webhook Error: ${error.message}`);
      return;
    }

    console.log(`Stripe webhook received: ${event.type} (${event.id})`);

    try {
      const shouldProcess = await billingService.beginStripeEvent(event.id, event.type);
      if (!shouldProcess) {
        res.json({ received: true, deduplicated: true });
        return;
      }

      let tenantId: string | null = null;

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;

          if (
            session.metadata?.billingKind === 'saas' &&
            session.subscription
          ) {
            const subscriptionId =
              typeof session.subscription === 'string'
                ? session.subscription
                : session.subscription.id;
            const synced = await billingService.syncSubscriptionById(subscriptionId);
            tenantId = synced?.tenantId || session.metadata?.tenantId || null;
            break;
          }

          const orderId = session.metadata?.orderId;
          if (orderId && session.payment_status === 'paid') {
            await ordersService.handlePaymentSuccess(
              orderId,
              session.payment_intent as string
            );
          }
          break;
        }

        case 'checkout.session.async_payment_succeeded': {
          const session = event.data.object as Stripe.Checkout.Session;
          const orderId = session.metadata?.orderId;

          if (orderId) {
            await ordersService.handlePaymentSuccess(
              orderId,
              session.payment_intent as string
            );
          }
          break;
        }

        case 'checkout.session.async_payment_failed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const orderId = session.metadata?.orderId;

          if (orderId) {
            await ordersService.handlePaymentFailure(orderId);
          }
          break;
        }

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          const synced = await billingService.syncSubscription(
            event.data.object as Stripe.Subscription
          );
          tenantId = synced?.tenantId || null;
          break;
        }

        case 'invoice.paid':
        case 'invoice.payment_failed': {
          const subscriptionId = invoiceSubscriptionId(event.data.object);
          if (subscriptionId) {
            const synced = await billingService.syncSubscriptionById(subscriptionId);
            tenantId = synced?.tenantId || null;
          }
          break;
        }

        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log(`Payment intent succeeded: ${paymentIntent.id}`);
          break;
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log(`Payment intent failed: ${paymentIntent.id}`);
          break;
        }

        case 'charge.refunded': {
          const charge = event.data.object as Stripe.Charge;
          const paymentIntentId =
            typeof charge.payment_intent === 'string'
              ? charge.payment_intent
              : charge.payment_intent?.id;

          if (paymentIntentId) {
            await ordersService.handleRefund(paymentIntentId);
          }
          break;
        }

        default:
          console.log(`Unhandled Stripe event type: ${event.type}`);
      }

      await billingService.markStripeEventProcessed(event.id, tenantId);
      res.json({ received: true });
    } catch (error) {
      console.error('Stripe webhook handler error:', error);
      try {
        await billingService.markStripeEventFailed(event.id, error);
      } catch (trackingError) {
        console.error('Could not persist Stripe webhook failure:', trackingError);
      }
      res.status(500).json({ error: 'Webhook handler failed' });
    }
  }
);

export default router;
