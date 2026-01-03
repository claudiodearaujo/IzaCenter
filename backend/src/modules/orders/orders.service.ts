// apps/backend/src/modules/orders/orders.service.ts

import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { stripeHelpers } from '../../config/stripe';
import { Errors } from '../../middlewares/error.middleware';
import { generateOrderNumber, buildPaginationMeta, addDays } from '../../utils';
import { sendEmail, emailTemplates } from '../../utils/email.util';
import { CreateOrderDto, UpdateOrderDto, QueryOrdersDto, AddQuestionsDto } from './orders.schema';

export class OrdersService {
  /**
   * Create order from cart
   */
  async create(clientId: string, data: CreateOrderDto) {
    // Get client
    const client = await prisma.user.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        email: true,
        fullName: true,
        stripeCustomerId: true,
      },
    });

    if (!client) {
      throw Errors.NotFound('Cliente');
    }

    // Get products
    const productIds = data.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    if (products.length !== productIds.length) {
      throw Errors.BadRequest('Um ou mais produtos não estão disponíveis');
    }

    // Calculate totals
    let subtotal = new Decimal(0);
    const orderItems = data.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const quantity = item.quantity || 1;
      const unitPrice = new Decimal(product.price);
      const totalPrice = unitPrice.mul(quantity);
      subtotal = subtotal.add(totalPrice);

      return {
        productId: product.id,
        productName: product.name,
        productType: product.productType,
        unitPrice,
        quantity,
        totalPrice,
        clientQuestions: item.questions || [],
      };
    });

    // Apply coupon if provided
    let discount = new Decimal(0);
    if (data.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: data.couponCode.toUpperCase() },
      });

      if (coupon && coupon.isActive) {
        const now = new Date();
        const isValid =
          (!coupon.validFrom || coupon.validFrom <= now) &&
          (!coupon.validUntil || coupon.validUntil >= now) &&
          (!coupon.maxUses || coupon.usesCount < coupon.maxUses) &&
          (!coupon.minOrderValue || subtotal.gte(coupon.minOrderValue));

        if (isValid) {
          if (coupon.discountType === 'PERCENTAGE') {
            discount = subtotal.mul(coupon.discountValue).div(100);
          } else {
            discount = new Decimal(coupon.discountValue);
          }

          // Update coupon usage
          await prisma.coupon.update({
            where: { id: coupon.id },
            data: { usesCount: { increment: 1 } },
          });
        }
      }
    }

    const total = subtotal.sub(discount);

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        clientId,
        subtotal,
        discount,
        total,
        clientNotes: data.clientNotes,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        client: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    // Get or create Stripe customer
    let stripeCustomerId = client.stripeCustomerId;
    if (!stripeCustomerId) {
      const stripeCustomer = await stripeHelpers.getOrCreateCustomer(
        client.email,
        client.fullName,
        { userId: client.id }
      );
      stripeCustomerId = stripeCustomer.id;

      await prisma.user.update({
        where: { id: clientId },
        data: { stripeCustomerId },
      });
    }

    // Create Stripe checkout session
    const lineItems = order.items.map((item) =>
      stripeHelpers.createPriceData(
        Number(item.unitPrice) * item.quantity,
        item.productName,
        `Quantidade: ${item.quantity}`
      )
    );

    const checkoutSession = await stripeHelpers.createCheckoutSession({
      customerId: stripeCustomerId,
      lineItems,
      orderId: order.id,
      successUrl: `${env.FRONTEND_URL}/cliente/pedidos/${order.id}?success=true`,
      cancelUrl: `${env.FRONTEND_URL}/loja/checkout?cancelled=true`,
    });

    // Update order with Stripe session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeCheckoutSessionId: checkoutSession.id },
    });

    return {
      order,
      checkoutUrl: checkoutSession.url,
    };
  }

  /**
   * Get order by ID
   */
  async getById(id: string, clientId?: string) {
    const where: any = { id };
    if (clientId) {
      where.clientId = clientId;
    }

    const order = await prisma.order.findFirst({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                coverImageUrl: true,
                productType: true,
              },
            },
            reading: {
              select: {
                id: true,
                title: true,
                status: true,
                publishedAt: true,
              },
            },
            appointment: {
              select: {
                id: true,
                scheduledDate: true,
                startTime: true,
                status: true,
              },
            },
          },
        },
        client: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      throw Errors.NotFound('Pedido');
    }

    return order;
  }

  /**
   * Get order by order number
   */
  async getByOrderNumber(orderNumber: string, clientId?: string) {
    const where: any = { orderNumber };
    if (clientId) {
      where.clientId = clientId;
    }

    const order = await prisma.order.findFirst({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw Errors.NotFound('Pedido');
    }

    return order;
  }

  /**
   * List orders
   */
  async list(query: QueryOrdersDto, clientId?: string) {
    const { page, limit, search, status, startDate, endDate, sortBy, sortOrder } = query;

    const where: any = {};

    if (clientId) {
      where.clientId = clientId;
    }

    if (query.clientId) {
      where.clientId = query.clientId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { client: { fullName: { contains: search, mode: 'insensitive' } } },
        { client: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          client: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          items: {
            select: {
              id: true,
              productName: true,
              quantity: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  /**
   * Update order status (admin)
   */
  async update(id: string, data: UpdateOrderDto) {
    const order = await prisma.order.update({
      where: { id },
      data: {
        ...data,
        ...(data.status === 'COMPLETED' && { completedAt: new Date() }),
        ...(data.status === 'CANCELLED' && { cancelledAt: new Date() }),
      },
      include: {
        items: true,
        client: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    return order;
  }

  /**
   * Handle successful payment (webhook)
   */
  async handlePaymentSuccess(orderId: string, paymentIntentId: string) {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        paymentStatus: 'SUCCEEDED',
        stripePaymentIntentId: paymentIntentId,
        paidAt: new Date(),
      },
      include: {
        items: {
          include: { product: true },
        },
        client: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    // Create readings for each order item
    for (const item of order.items) {
      if (!item.product.requiresScheduling) {
        await prisma.reading.create({
          data: {
            orderItemId: item.id,
            clientId: order.clientId,
            title: `Leitura - ${item.productName}`,
            status: 'PENDING',
            clientQuestion: item.clientQuestions.join('\n'),
            expiresAt: addDays(new Date(), item.product.validityDays),
          },
        });
      }
    }

    // Send confirmation email
    const emailContent = emailTemplates.orderConfirmation(
      order.client.fullName,
      order.orderNumber,
      order.items.map((item) => ({
        name: item.productName,
        price: Number(item.totalPrice),
      })),
      Number(order.total)
    );

    sendEmail({
      to: order.client.email,
      subject: emailContent.subject,
      html: emailContent.html,
    }).catch(console.error);

    return order;
  }

  /**
   * Add questions to order item
   */
  async addQuestions(orderItemId: string, clientId: string, data: AddQuestionsDto) {
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        id: orderItemId,
        order: { clientId },
      },
      include: { order: true },
    });

    if (!orderItem) {
      throw Errors.NotFound('Item do pedido');
    }

    if (orderItem.order.status !== 'PAID' && orderItem.order.status !== 'PROCESSING') {
      throw Errors.BadRequest('Só é possível adicionar perguntas em pedidos pagos');
    }

    await prisma.orderItem.update({
      where: { id: orderItemId },
      data: { clientQuestions: data.questions },
    });

    // Update reading if exists
    const reading = await prisma.reading.findUnique({
      where: { orderItemId },
    });

    if (reading) {
      await prisma.reading.update({
        where: { id: reading.id },
        data: { clientQuestion: data.questions.join('\n') },
      });
    }

    return { message: 'Perguntas adicionadas com sucesso' };
  }

  /**
   * Cancel order
   */
  async cancel(id: string, clientId?: string) {
    const where: any = { id };
    if (clientId) {
      where.clientId = clientId;
    }

    const order = await prisma.order.findFirst({ where });

    if (!order) {
      throw Errors.NotFound('Pedido');
    }

    if (order.status !== 'PENDING') {
      throw Errors.BadRequest('Só é possível cancelar pedidos pendentes');
    }

    await prisma.order.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    });

    return { message: 'Pedido cancelado com sucesso' };
  }

  /**
   * Get order statistics (admin)
   */
  async getStatistics(startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [totalOrders, paidOrders, revenue, statusCounts] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.count({ where: { ...where, status: 'PAID' } }),
      prisma.order.aggregate({
        where: { ...where, paymentStatus: 'SUCCEEDED' },
        _sum: { total: true },
      }),
      prisma.order.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
    ]);

    return {
      totalOrders,
      paidOrders,
      revenue: revenue._sum.total || 0,
      statusCounts: statusCounts.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}

export const ordersService = new OrdersService();
