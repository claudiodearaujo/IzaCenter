/**
 * Integration Tests for Orders API
 * 
 * These tests verify the order creation and management flow.
 */

import {
  testPrisma,
  cleanDatabase,
  createTestUser,
  createTestCategory,
  createTestProduct,
  createTestOrder,
  disconnectTestDatabase,
} from './setup';

describe('Orders Integration Tests', () => {
  let testUser: any;
  let testCategory: any;
  let testProduct: any;

  beforeAll(async () => {
    await cleanDatabase();

    // Create base test data
    testUser = await createTestUser({
      email: 'order-test@test.com',
      fullName: 'Order Test User',
    });

    testCategory = await createTestCategory({
      name: 'Test Category',
      slug: 'test-category',
    });

    testProduct = await createTestProduct({
      name: 'Test Product',
      categoryId: testCategory.id,
      price: 150,
    });
  });

  afterAll(async () => {
    await cleanDatabase();
    await disconnectTestDatabase();
  });

  describe('Order CRUD Operations', () => {
    it('should create an order with items', async () => {
      // Act
      const order = await createTestOrder({
        clientId: testUser.id,
        items: [
          { productId: testProduct.id, productName: testProduct.name, quantity: 2, unitPrice: 150 },
        ],
      });

      // Assert
      expect(order.id).toBeDefined();
      expect(order.orderNumber).toContain('ORD-TEST');
      expect(Number(order.total)).toBe(300);
      expect(order.items).toHaveLength(1);
      expect(order.items[0].quantity).toBe(2);
    });

    it('should find order by id with related data', async () => {
      // Arrange
      const createdOrder = await createTestOrder({
        clientId: testUser.id,
        items: [{ productId: testProduct.id, productName: testProduct.name, quantity: 1, unitPrice: 150 }],
      });

      // Act
      const order = await testPrisma.order.findUnique({
        where: { id: createdOrder.id },
        include: {
          client: true,
          items: {
            include: { product: true },
          },
        },
      });

      // Assert
      expect(order).not.toBeNull();
      expect(order?.client.email).toBe('order-test@test.com');
      expect(order?.items[0].product.name).toBe('Test Product');
    });

    it('should find orders by user', async () => {
      // Act
      const orders = await testPrisma.order.findMany({
        where: { clientId: testUser.id },
      });

      // Assert
      expect(orders.length).toBeGreaterThanOrEqual(2);
    });

    it('should update order status', async () => {
      // Arrange
      const order = await createTestOrder({
        clientId: testUser.id,
        items: [{ productId: testProduct.id, productName: testProduct.name, quantity: 1, unitPrice: 150 }],
      });

      // Act
      const updatedOrder = await testPrisma.order.update({
        where: { id: order.id },
        data: {
          status: 'COMPLETED',
          paymentStatus: 'SUCCEEDED',
        },
      });

      // Assert
      expect(updatedOrder.status).toBe('COMPLETED');
      expect(updatedOrder.paymentStatus).toBe('SUCCEEDED');
    });
  });

  describe('Order Queries', () => {
    it('should calculate total revenue from succeeded orders', async () => {
      // Arrange - Create succeeded orders
      const order1 = await createTestOrder({
        clientId: testUser.id,
        items: [{ productId: testProduct.id, productName: testProduct.name, quantity: 1, unitPrice: 100 }],
      });
      await testPrisma.order.update({
        where: { id: order1.id },
        data: { paymentStatus: 'SUCCEEDED' },
      });

      const order2 = await createTestOrder({
        clientId: testUser.id,
        items: [{ productId: testProduct.id, productName: testProduct.name, quantity: 1, unitPrice: 200 }],
      });
      await testPrisma.order.update({
        where: { id: order2.id },
        data: { paymentStatus: 'SUCCEEDED' },
      });

      // Act
      const result = await testPrisma.order.aggregate({
        where: { paymentStatus: 'SUCCEEDED' },
        _sum: { total: true },
      });

      // Assert
      expect(Number(result._sum.total)).toBeGreaterThanOrEqual(300);
    });

    it('should get orders count by status', async () => {
      // Act
      const pendingCount = await testPrisma.order.count({
        where: { status: 'PENDING' },
      });

      const completedCount = await testPrisma.order.count({
        where: { status: 'COMPLETED' },
      });

      // Assert
      expect(pendingCount).toBeGreaterThanOrEqual(0);
      expect(completedCount).toBeGreaterThanOrEqual(0);
    });

    it('should get recent orders ordered by creation date', async () => {
      // Act
      const recentOrders = await testPrisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      // Assert
      expect(recentOrders.length).toBeLessThanOrEqual(5);
      
      // Verify order is descending
      for (let i = 1; i < recentOrders.length; i++) {
        expect(recentOrders[i - 1].createdAt.getTime())
          .toBeGreaterThanOrEqual(recentOrders[i].createdAt.getTime());
      }
    });
  });

  describe('Order Business Rules', () => {
    it('should cascade delete order items when order is deleted', async () => {
      // Arrange
      const order = await createTestOrder({
        clientId: testUser.id,
        items: [
          { productId: testProduct.id, productName: testProduct.name, quantity: 1, unitPrice: 100 },
        ],
      });
      const itemId = order.items[0].id;

      // Act
      await testPrisma.order.delete({
        where: { id: order.id },
      });

      // Assert
      const deletedItem = await testPrisma.orderItem.findUnique({
        where: { id: itemId },
      });
      expect(deletedItem).toBeNull();
    });
  });
});
