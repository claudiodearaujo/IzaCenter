// apps/backend/src/modules/webhooks/stripe.webhook.ts

import { Router, Request, Response } from 'express';
import express from 'express';
import { stripe, stripeHelpers } from '../../config/stripe';
import { ordersService } from '../orders/orders.service';
import { env } from '../../config/env';
import { cache } from '../../config/redis';

const router = Router();

/**
 * Check if a webhook event has already been processed (idempotency)
 */
async function isEventProcessed(eventId: string): Promise<boolean> {
  return cache.exists(`webhook:${eventId}`);
}

/**
 * Mark a webhook event as processed
 */
async function markEventProcessed(eventId: string): Promise<void> {
  // Keep for 24 hours to prevent reprocessing
  await cache.set(`webhook:${eventId}`, 'processed', 86400);
}

/**
 * POST /webhooks/stripe
 * Handle Stripe webhook events
 */
router.post(
  '/',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string;

    let event;

    try {
      event = stripeHelpers.constructEvent(req.body, signature);
    } catch (error: any) {
      console.error('❌ Webhook signature verification failed:', error.message);
      res.status(400).send(`Webhook Error: ${error.message}`);
      return;
    }

    console.log(`📥 Stripe webhook received: ${event.type} (${event.id})`);

    // Idempotency check
    try {
      if (await isEventProcessed(event.id)) {
        console.log(`⏭️ Event ${event.id} already processed, skipping`);
        res.json({ received: true, deduplicated: true });
        return;
      }
    } catch {
      // If Redis is unavailable, proceed without idempotency
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          const orderId = session.metadata?.orderId;

          if (orderId && session.payment_status === 'paid') {
            await ordersService.handlePaymentSuccess(
              orderId,
              session.payment_intent as string
            );
            console.log(`✅ Order ${orderId} payment successful`);
          }
          break;
        }

        case 'checkout.session.async_payment_succeeded': {
          // Handle async payment methods (boleto, pix)
          const session = event.data.object;
          const orderId = session.metadata?.orderId;

          if (orderId) {
            await ordersService.handlePaymentSuccess(
              orderId,
              session.payment_intent as string
            );
            console.log(`✅ Order ${orderId} async payment successful`);
          }
          break;
        }

        case 'checkout.session.async_payment_failed': {
          const session = event.data.object;
          const orderId = session.metadata?.orderId;

          if (orderId) {
            await ordersService.handlePaymentFailure(orderId);
            console.log(`❌ Order ${orderId} async payment failed — status updated`);
          }
          break;
        }

        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object;
          console.log(`💰 Payment intent succeeded: ${paymentIntent.id}`);
          break;
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object;
          console.log(`❌ Payment intent failed: ${paymentIntent.id}`);
          break;
        }

        case 'charge.refunded': {
          const charge = event.data.object;
          const paymentIntentId = charge.payment_intent as string;
          if (paymentIntentId) {
            await ordersService.handleRefund(paymentIntentId);
            console.log(`↩️ Charge refunded: ${charge.id} — order status updated`);
          }
          break;
        }

        default:
          console.log(`ℹ️ Unhandled event type: ${event.type}`);
      }

      // Mark event as processed for idempotency
      try {
        await markEventProcessed(event.id);
      } catch {
        // Non-critical: continue even if Redis fails
      }

      res.json({ received: true });
    } catch (error) {
      console.error('❌ Webhook handler error:', error);
      res.status(500).json({ error: 'Webhook handler failed' });
    }
  }
);

export default router;
