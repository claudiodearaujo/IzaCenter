import { OrdersService } from './orders.service';
import { prismaMock } from '../../test/mocks/prisma.mock';
import { Decimal } from '@prisma/client/runtime/library';

// Mock stripe helpers
jest.mock('../../config/stripe', () => ({
  stripeHelpers: {
    getOrCreateCustomer: jest.fn().mockResolvedValue({ id: 'cus_test123' }),
    createPriceData: jest.fn().mockReturnValue({
      price_data: {
        currency: 'brl',
        product_data: { name: 'Test Product' },
        unit_amount: 5000,
      },
      quantity: 1,
    }),
    createCheckoutSession: jest.fn().mockResolvedValue({
      id: 'cs_test123',
      url: 'https://checkout.stripe.com/test',
    }),
  },
}));

// Mock email utils
jest.mock('../../utils/email.util', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
  emailTemplates: {
    orderConfirmation: jest.fn().mockReturnValue({
      subject: 'Pedido Confirmado',
      html: '<p>Pedido confirmado</p>',
    }),
  },
}));

// Mock utils
jest.mock('../../utils', () => ({
  generateOrderNumber: jest.fn().mockReturnValue('ORD-2026-0001'),
  buildPaginationMeta: jest.fn().mockReturnValue({
    currentPage: 1,
    totalPages: 1,
    totalItems: 1,
    itemsPerPage: 10,
  }),
  addDays: jest.fn().mockImplementation((date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }),
}));

describe('OrdersService', () => {
  let ordersService: OrdersService;

  beforeEach(() => {
    ordersService = new OrdersService();
    jest.clearAllMocks();
  });

  // =============================================
  // CREATE
  // =============================================
  describe('create', () => {
    const clientId = 'client-123';
    const createOrderData = {
      items: [
        {
          productId: 'product-123',
          quantity: 1,
          questions: ['Qual é meu futuro profissional?'],
        },
      ],
      clientNotes: 'Urgente por favor',
    };

    const mockClient = {
      id: clientId,
      email: 'client@test.com',
      fullName: 'Cliente Teste',
      stripeCustomerId: null,
    };

    const mockProduct = {
      id: 'product-123',
      name: 'Leitura Completa',
      price: new Decimal('50.00'),
      productType: 'QUESTION',
      isActive: true,
      validityDays: 365,
    };

    it('should create order successfully with new stripe customer', async () => {
      // Arrange
      prismaMock.user.findUnique.mockResolvedValue(mockClient as any);
      prismaMock.product.findMany.mockResolvedValue([mockProduct] as any);
      prismaMock.order.create.mockResolvedValue({
        id: 'order-123',
        orderNumber: 'ORD-2026-0001',
        clientId,
        subtotal: new Decimal('50.00'),
        discount: new Decimal('0'),
        total: new Decimal('50.00'),
        status: 'PENDING',
        paymentStatus: 'PENDING',
        items: [
          {
            id: 'item-123',
            productId: 'product-123',
            productName: 'Leitura Completa',
            productType: 'QUESTION',
            unitPrice: new Decimal('50.00'),
            quantity: 1,
            totalPrice: new Decimal('50.00'),
            clientQuestions: ['Qual é meu futuro profissional?'],
            product: mockProduct,
          },
        ],
        client: mockClient,
      } as any);
      prismaMock.user.update.mockResolvedValue(mockClient as any);
      prismaMock.order.update.mockResolvedValue({} as any);

      // Act
      const result = await ordersService.create(clientId, createOrderData);

      // Assert
      expect(result.order.orderNumber).toBe('ORD-2026-0001');
      expect(result.checkoutUrl).toBe('https://checkout.stripe.com/test');
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: clientId },
        select: {
          id: true,
          email: true,
          fullName: true,
          stripeCustomerId: true,
        },
      });
      expect(prismaMock.product.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['product-123'] }, isActive: true },
      });
    });

    it('should throw error if client not found', async () => {
      // Arrange
      prismaMock.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(ordersService.create(clientId, createOrderData)).rejects.toThrow(
        'Cliente'
      );
    });

    it('should throw error if product not available', async () => {
      // Arrange
      prismaMock.user.findUnique.mockResolvedValue(mockClient as any);
      prismaMock.product.findMany.mockResolvedValue([]);

      // Act & Assert
      await expect(ordersService.create(clientId, createOrderData)).rejects.toThrow(
        'Um ou mais produtos não estão disponíveis'
      );
    });

    it('should apply valid coupon discount', async () => {
      // Arrange
      const dataWithCoupon = {
        ...createOrderData,
        couponCode: 'SAVE10',
      };

      const mockCoupon = {
        id: 'coupon-123',
        code: 'SAVE10',
        isActive: true,
        discountType: 'PERCENTAGE',
        discountValue: new Decimal('10'),
        usesCount: 0,
        maxUses: 100,
        validFrom: null,
        validUntil: null,
        minOrderValue: null,
      };

      prismaMock.user.findUnique.mockResolvedValue(mockClient as any);
      prismaMock.product.findMany.mockResolvedValue([mockProduct] as any);
      prismaMock.coupon.findUnique.mockResolvedValue(mockCoupon as any);
      prismaMock.coupon.update.mockResolvedValue(mockCoupon as any);
      prismaMock.order.create.mockResolvedValue({
        id: 'order-123',
        orderNumber: 'ORD-2026-0001',
        subtotal: new Decimal('50.00'),
        discount: new Decimal('5.00'),
        total: new Decimal('45.00'),
        items: [{ product: mockProduct }],
        client: mockClient,
      } as any);
      prismaMock.user.update.mockResolvedValue(mockClient as any);
      prismaMock.order.update.mockResolvedValue({} as any);

      // Act
      const result = await ordersService.create(clientId, dataWithCoupon);

      // Assert
      expect(prismaMock.coupon.findUnique).toHaveBeenCalledWith({
        where: { code: 'SAVE10' },
      });
      expect(prismaMock.coupon.update).toHaveBeenCalledWith({
        where: { id: 'coupon-123' },
        data: { usesCount: { increment: 1 } },
      });
    });
  });

  // =============================================
  // GET BY ID
  // =============================================
  describe('getById', () => {
    const orderId = 'order-123';
    const mockOrder = {
      id: orderId,
      orderNumber: 'ORD-2026-0001',
      clientId: 'client-123',
      status: 'PAID',
      items: [],
      client: {
        id: 'client-123',
        email: 'client@test.com',
        fullName: 'Cliente Teste',
        phone: '11999999999',
      },
    };

    it('should get order by id successfully', async () => {
      // Arrange
      prismaMock.order.findFirst.mockResolvedValue(mockOrder as any);

      // Act
      const result = await ordersService.getById(orderId);

      // Assert
      expect(result.id).toBe(orderId);
      expect(result.orderNumber).toBe('ORD-2026-0001');
      expect(prismaMock.order.findFirst).toHaveBeenCalledWith({
        where: { id: orderId },
        include: expect.objectContaining({
          items: expect.any(Object),
          client: expect.any(Object),
        }),
      });
    });

    it('should get order by id with clientId filter', async () => {
      // Arrange
      const clientId = 'client-123';
      prismaMock.order.findFirst.mockResolvedValue(mockOrder as any);

      // Act
      const result = await ordersService.getById(orderId, clientId);

      // Assert
      expect(result.id).toBe(orderId);
      expect(prismaMock.order.findFirst).toHaveBeenCalledWith({
        where: { id: orderId, clientId },
        include: expect.any(Object),
      });
    });

    it('should throw error if order not found', async () => {
      // Arrange
      prismaMock.order.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(ordersService.getById(orderId)).rejects.toThrow('Pedido');
    });
  });

  // =============================================
  // HANDLE PAYMENT SUCCESS
  // =============================================
  describe('handlePaymentSuccess', () => {
    const orderId = 'order-123';
    const paymentIntentId = 'pi_test123';

    const mockOrder = {
      id: orderId,
      clientId: 'client-123',
      status: 'PAID',
      paymentStatus: 'SUCCEEDED',
      stripePaymentIntentId: paymentIntentId,
      paidAt: new Date(),
      orderNumber: 'ORD-2026-0001',
      total: new Decimal('50.00'),
      items: [
        {
          id: 'item-123',
          productId: 'product-123',
          productName: 'Leitura Completa',
          clientQuestions: ['Qual é meu futuro?'],
          product: {
            requiresScheduling: false,
            validityDays: 365,
          },
        },
      ],
      client: {
        id: 'client-123',
        email: 'client@test.com',
        fullName: 'Cliente Teste',
      },
    };

    it('should handle payment success and create readings', async () => {
      // Arrange
      prismaMock.order.update.mockResolvedValue(mockOrder as any);
      prismaMock.reading.create.mockResolvedValue({
        id: 'reading-123',
        orderItemId: 'item-123',
        clientId: 'client-123',
        title: 'Leitura - Leitura Completa',
        status: 'PENDING',
      } as any);

      // Act
      const result = await ordersService.handlePaymentSuccess(orderId, paymentIntentId);

      // Assert
      expect(result.status).toBe('PAID');
      expect(result.paymentStatus).toBe('SUCCEEDED');
      expect(prismaMock.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: {
          status: 'PAID',
          paymentStatus: 'SUCCEEDED',
          stripePaymentIntentId: paymentIntentId,
          paidAt: expect.any(Date),
        },
        include: expect.any(Object),
      });
      expect(prismaMock.reading.create).toHaveBeenCalled();
    });

    it('should not create reading for products requiring scheduling', async () => {
      // Arrange
      const orderWithScheduling = {
        ...mockOrder,
        items: [
          {
            ...mockOrder.items[0],
            product: {
              requiresScheduling: true,
              validityDays: 365,
            },
          },
        ],
      };
      prismaMock.order.update.mockResolvedValue(orderWithScheduling as any);

      // Act
      await ordersService.handlePaymentSuccess(orderId, paymentIntentId);

      // Assert
      expect(prismaMock.reading.create).not.toHaveBeenCalled();
    });
  });

  // =============================================
  // LIST
  // =============================================
  describe('list', () => {
    const mockOrders = [
      {
        id: 'order-1',
        orderNumber: 'ORD-2026-0001',
        status: 'PAID',
        client: { id: 'client-1', fullName: 'Cliente 1', email: 'client1@test.com' },
        items: [{ id: 'item-1', productName: 'Produto 1', quantity: 1 }],
      },
    ];

    it('should list orders with pagination', async () => {
      // Arrange
      const query = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt' as const,
        sortOrder: 'desc' as const,
      };
      prismaMock.order.findMany.mockResolvedValue(mockOrders as any);
      prismaMock.order.count.mockResolvedValue(1);

      // Act
      const result = await ordersService.list(query);

      // Assert
      expect(result.data).toEqual(mockOrders);
      expect(result.meta).toBeDefined();
      expect(prismaMock.order.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
    });

    it('should filter by clientId', async () => {
      // Arrange
      const query = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt' as const,
        sortOrder: 'desc' as const,
      };
      const clientId = 'client-123';
      prismaMock.order.findMany.mockResolvedValue(mockOrders as any);
      prismaMock.order.count.mockResolvedValue(1);

      // Act
      await ordersService.list(query, clientId);

      // Assert
      expect(prismaMock.order.findMany).toHaveBeenCalledWith({
        where: { clientId },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
    });

    it('should filter by status', async () => {
      // Arrange
      const query = {
        page: 1,
        limit: 10,
        status: 'PAID' as const,
        sortBy: 'createdAt' as const,
        sortOrder: 'desc' as const,
      };
      prismaMock.order.findMany.mockResolvedValue(mockOrders as any);
      prismaMock.order.count.mockResolvedValue(1);

      // Act
      await ordersService.list(query);

      // Assert
      expect(prismaMock.order.findMany).toHaveBeenCalledWith({
        where: { status: 'PAID' },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
    });

    it('should search by order number or client name', async () => {
      // Arrange
      const query = {
        page: 1,
        limit: 10,
        search: 'ORD-2026',
        sortBy: 'createdAt' as const,
        sortOrder: 'desc' as const,
      };
      prismaMock.order.findMany.mockResolvedValue(mockOrders as any);
      prismaMock.order.count.mockResolvedValue(1);

      // Act
      await ordersService.list(query);

      // Assert
      expect(prismaMock.order.findMany).toHaveBeenCalledWith({
        where: {
          OR: expect.arrayContaining([
            { orderNumber: { contains: 'ORD-2026', mode: 'insensitive' } },
          ]),
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
    });
  });

  // =============================================
  // CANCEL
  // =============================================
  describe('cancel', () => {
    const orderId = 'order-123';

    it('should cancel pending order successfully', async () => {
      // Arrange
      const mockOrder = {
        id: orderId,
        status: 'PENDING',
      };
      prismaMock.order.findFirst.mockResolvedValue(mockOrder as any);
      prismaMock.order.update.mockResolvedValue({
        ...mockOrder,
        status: 'CANCELLED',
        cancelledAt: new Date(),
      } as any);

      // Act
      const result = await ordersService.cancel(orderId);

      // Assert
      expect(result.message).toBe('Pedido cancelado com sucesso');
      expect(prismaMock.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          cancelledAt: expect.any(Date),
        },
      });
    });

    it('should throw error if order not found', async () => {
      // Arrange
      prismaMock.order.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(ordersService.cancel(orderId)).rejects.toThrow('Pedido');
    });

    it('should throw error if order is not pending', async () => {
      // Arrange
      const mockOrder = {
        id: orderId,
        status: 'PAID',
      };
      prismaMock.order.findFirst.mockResolvedValue(mockOrder as any);

      // Act & Assert
      await expect(ordersService.cancel(orderId)).rejects.toThrow(
        'Só é possível cancelar pedidos pendentes'
      );
    });
  });

  // =============================================
  // ADD QUESTIONS
  // =============================================
  describe('addQuestions', () => {
    const orderItemId = 'item-123';
    const clientId = 'client-123';
    const questionsData = {
      questions: ['Nova pergunta 1', 'Nova pergunta 2'],
    };

    it('should add questions to paid order item', async () => {
      // Arrange
      const mockOrderItem = {
        id: orderItemId,
        order: {
          clientId,
          status: 'PAID',
        },
      };
      const mockReading = {
        id: 'reading-123',
        orderItemId,
      };

      prismaMock.orderItem.findFirst.mockResolvedValue(mockOrderItem as any);
      prismaMock.orderItem.update.mockResolvedValue(mockOrderItem as any);
      prismaMock.reading.findUnique.mockResolvedValue(mockReading as any);
      prismaMock.reading.update.mockResolvedValue(mockReading as any);

      // Act
      const result = await ordersService.addQuestions(orderItemId, clientId, questionsData);

      // Assert
      expect(result.message).toBe('Perguntas adicionadas com sucesso');
      expect(prismaMock.orderItem.update).toHaveBeenCalledWith({
        where: { id: orderItemId },
        data: { clientQuestions: questionsData.questions },
      });
      expect(prismaMock.reading.update).toHaveBeenCalledWith({
        where: { id: 'reading-123' },
        data: { clientQuestion: 'Nova pergunta 1\nNova pergunta 2' },
      });
    });

    it('should throw error if order item not found', async () => {
      // Arrange
      prismaMock.orderItem.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        ordersService.addQuestions(orderItemId, clientId, questionsData)
      ).rejects.toThrow('Item do pedido');
    });

    it('should throw error if order is not paid', async () => {
      // Arrange
      const mockOrderItem = {
        id: orderItemId,
        order: {
          clientId,
          status: 'PENDING',
        },
      };
      prismaMock.orderItem.findFirst.mockResolvedValue(mockOrderItem as any);

      // Act & Assert
      await expect(
        ordersService.addQuestions(orderItemId, clientId, questionsData)
      ).rejects.toThrow('Só é possível adicionar perguntas em pedidos pagos');
    });
  });

  // =============================================
  // GET STATISTICS
  // =============================================
  describe('getStatistics', () => {
    it('should return order statistics', async () => {
      // Arrange
      prismaMock.order.count.mockResolvedValueOnce(10); // total orders
      prismaMock.order.count.mockResolvedValueOnce(8); // paid orders
      prismaMock.order.aggregate.mockResolvedValue({
        _sum: { total: new Decimal('1000.00') },
      } as any);
      prismaMock.order.groupBy.mockResolvedValue([
        { status: 'PENDING', _count: 2 },
        { status: 'PAID', _count: 8 },
      ] as any);

      // Act
      const result = await ordersService.getStatistics();

      // Assert
      expect(result.totalOrders).toBe(10);
      expect(result.paidOrders).toBe(8);
      expect(result.revenue).toEqual(new Decimal('1000.00'));
      expect(result.statusCounts).toEqual({
        PENDING: 2,
        PAID: 8,
      });
    });

    it('should filter statistics by date range', async () => {
      // Arrange
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-31');

      prismaMock.order.count.mockResolvedValue(5);
      prismaMock.order.aggregate.mockResolvedValue({
        _sum: { total: new Decimal('500.00') },
      } as any);
      prismaMock.order.groupBy.mockResolvedValue([
        { status: 'PAID', _count: 5 },
      ] as any);

      // Act
      await ordersService.getStatistics(startDate, endDate);

      // Assert
      expect(prismaMock.order.count).toHaveBeenCalledWith({
        where: { createdAt: { gte: startDate, lte: endDate } },
      });
    });
  });
});
