// apps/backend/src/modules/webhooks/stripe.webhook.ts

import { Router, Request, Response } from 'express';
import express from 'express';
import { stripe, stripeHelpers } from '../../config/stripe';
import { ordersService } from '../orders/orders.service';
import { env } from '../../config/env';

const router = Router();

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

    console.log(`📥 Stripe webhook received: ${event.type}`);

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
            console.log(`❌ Order ${orderId} async payment failed`);
            // Could update order status to PAYMENT_FAILED
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
          console.log(`↩️ Charge refunded: ${charge.id}`);
          // Could update order status to REFUNDED
          break;
        }

        default:
          console.log(`ℹ️ Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('❌ Webhook handler error:', error);
      res.status(500).json({ error: 'Webhook handler failed' });
    }
  }
);

export default router;
