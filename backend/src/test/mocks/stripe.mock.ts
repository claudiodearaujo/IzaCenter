export const stripeMock = {
  customers: {
    list: jest.fn(),
    create: jest.fn(),
    retrieve: jest.fn(),
  },
  checkout: {
    sessions: {
      create: jest.fn(),
      retrieve: jest.fn(),
    },
  },
  refunds: {
    create: jest.fn(),
  },
  webhooks: {
    constructEvent: jest.fn(),
  },
};

export const stripeHelpersMock = {
  getOrCreateCustomer: jest.fn().mockResolvedValue({
    id: 'cus_test123',
    email: 'test@example.com',
  }),
  createCheckoutSession: jest.fn().mockResolvedValue({
    id: 'cs_test123',
    url: 'https://checkout.stripe.com/test',
  }),
  retrieveSession: jest.fn().mockResolvedValue({
    id: 'cs_test123',
    payment_status: 'paid',
    payment_intent: 'pi_test123',
  }),
  createRefund: jest.fn().mockResolvedValue({
    id: 're_test123',
    status: 'succeeded',
  }),
  constructEvent: jest.fn(),
  createPriceData: jest.fn().mockReturnValue({
    currency: 'brl',
    unit_amount: 4700,
    product_data: { name: 'Test Product' },
  }),
};

jest.mock('../../config/stripe', () => ({
  stripe: stripeMock,
  stripeHelpers: stripeHelpersMock,
}));
