// apps/backend/src/config/stripe.ts

import Stripe from 'stripe';
import { env } from './env';

// Initialize Stripe client
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Stripe helper functions
export const stripeHelpers = {
  /**
   * Create or get a Stripe customer
   */
  async getOrCreateCustomer(
    email: string,
    name: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.Customer> {
    // Search for existing customer
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    // Create new customer
    return stripe.customers.create({
      email,
      name,
      metadata,
    });
  },

  /**
   * Create a checkout session
   */
  async createCheckoutSession(params: {
    customerId: string;
    lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
    orderId: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Checkout.Session> {
    return stripe.checkout.sessions.create({
      customer: params.customerId,
      payment_method_types: ['card', 'boleto', 'pix'],
      line_items: params.lineItems,
      mode: 'payment',
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        orderId: params.orderId,
        ...params.metadata,
      },
      payment_intent_data: {
        metadata: {
          orderId: params.orderId,
        },
      },
      locale: 'pt-BR',
      billing_address_collection: 'required',
    });
  },

  /**
   * Retrieve a checkout session
   */
  async retrieveSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    return stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'line_items'],
    });
  },

  /**
   * Create a refund
   */
  async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: Stripe.RefundCreateParams.Reason
  ): Promise<Stripe.Refund> {
    return stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount,
      reason,
    });
  },

  /**
   * Verify webhook signature
   */
  constructEvent(
    payload: Buffer,
    signature: string
  ): Stripe.Event {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  },

  /**
   * Create a price object for one-time payments
   */
  createPriceData(
    amount: number,
    productName: string,
    productDescription?: string
  ): Stripe.Checkout.SessionCreateParams.LineItem {
    return {
      price_data: {
        currency: 'brl',
        product_data: {
          name: productName,
          description: productDescription,
        },
        unit_amount: Math.round(amount * 100), // Convert to cents
      },
      quantity: 1,
    };
  },
};

export default stripe;
