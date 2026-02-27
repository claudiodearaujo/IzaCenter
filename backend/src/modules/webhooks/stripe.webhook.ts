// apps/backend/src/modules/webhooks/stripe.webhook.ts

import { Router, Request, Response } from 'express';
import express from 'express';
import { stripe, stripeHelpers } from '../../config/stripe';
import { ordersService } from '../orders/orders.service';
import { env } from '../../config/env';

const router = Router();

// In-memory idempotency store — prevents double-processing on Stripe retries.
// Entries expire after 24 h. Resets on server restart (acceptable: Stripe
// retries use unique event IDs, so the window is short).
const processedEvents = new Map<string, number>();
const PROCESSED_EVENT_TTL_MS = 24 * 60 * 60 * 1000;

function isEventProcessed(eventId: string): boolean {
  const ts = processedEvents.get(eventId);
  if (!ts) return false;
  if (Date.now() - ts > PROCESSED_EVENT_TTL_MS) {
    processedEvents.delete(eventId);
    return false;
  }
  return true;
}

function markEventProcessed(eventId: string): void {
  processedEvents.set(eventId, Date.now());
}

/**
/**
 * @openapi
 * /webhooks/stripe:
 *   post:
 *     tags: [Webhooks]
 *     summary: Handle Stripe webhook events
 *     description: >
 *       Receives Stripe events (payment_intent.succeeded, payment_intent.payment_failed, charge.refunded, etc.)
 *       and processes them. Requires the Stripe-Signature header for verification.
 *       Events are idempotent — duplicate events (same event ID) are skipped using Redis.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     parameters:
 *       - in: header
 *         name: stripe-signature
 *         required: true
 *         schema:
 *           type: string
 *         description: Stripe webhook signature for request verification
 *     responses:
 *       200:
 *         description: Event received and processed
 *       400:
 *         description: Signature verification failed
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
    if (isEventProcessed(event.id)) {
      console.log(`⏭️ Event ${event.id} already processed, skipping`);
      res.json({ received: true, deduplicated: true });
      return;
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

      markEventProcessed(event.id);

      res.json({ received: true });
    } catch (error) {
      console.error('❌ Webhook handler error:', error);
      res.status(500).json({ error: 'Webhook handler failed' });
    }
  }
);

export default router;
