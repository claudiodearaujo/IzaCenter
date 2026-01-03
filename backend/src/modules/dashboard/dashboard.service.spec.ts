import { DashboardService } from './dashboard.service';
import { prismaMock } from '../../test/mocks/prisma.mock';

describe('DashboardService', () => {
  let dashboardService: DashboardService;

  beforeEach(() => {
    dashboardService = new DashboardService();
    jest.clearAllMocks();
  });

  // =============================================
  // GET STATS
  // =============================================
  describe('getStats', () => {
    it('should return all dashboard statistics', async () => {
      // Arrange - Setup all the mocked counts and aggregates
      prismaMock.order.count.mockResolvedValueOnce(100);  // totalOrders
      prismaMock.order.count.mockResolvedValueOnce(15);   // thisMonthOrders
      prismaMock.order.count.mockResolvedValueOnce(10);   // lastMonthOrders
      prismaMock.order.count.mockResolvedValueOnce(5);    // pendingOrders

      prismaMock.order.aggregate.mockResolvedValueOnce({ _sum: { total: 50000 } } as any); // totalRevenue
      prismaMock.order.aggregate.mockResolvedValueOnce({ _sum: { total: 7500 } } as any);  // thisMonthRevenue
      prismaMock.order.aggregate.mockResolvedValueOnce({ _sum: { total: 5000 } } as any);  // lastMonthRevenue

      prismaMock.user.count.mockResolvedValueOnce(50);    // totalUsers
      prismaMock.user.count.mockResolvedValueOnce(8);     // newUsersThisMonth

      prismaMock.product.count.mockResolvedValueOnce(20); // totalProducts
      prismaMock.product.count.mockResolvedValueOnce(15); // activeProducts

      prismaMock.reading.count.mockResolvedValueOnce(3);  // pendingReadings
      prismaMock.reading.count.mockResolvedValueOnce(25); // publishedReadings

      prismaMock.appointment.count.mockResolvedValueOnce(2); // todayAppointments
      prismaMock.appointment.count.mockResolvedValueOnce(8); // pendingAppointments

      prismaMock.testimonial.count.mockResolvedValueOnce(4); // pendingTestimonials

      // Act
      const result = await dashboardService.getStats();

      // Assert
      expect(result.data.orders.total).toBe(100);
      expect(result.data.orders.thisMonth).toBe(15);
      expect(result.data.orders.pending).toBe(5);
      expect(result.data.orders.growth).toBe(50); // (15-10)/10 * 100 = 50%
      
      expect(result.data.revenue.total).toBe(50000);
      expect(result.data.revenue.thisMonth).toBe(7500);
      expect(result.data.revenue.growth).toBe(50); // (7500-5000)/5000 * 100 = 50%
      
      expect(result.data.users.total).toBe(50);
      expect(result.data.users.newThisMonth).toBe(8);
      
      expect(result.data.products.total).toBe(20);
      expect(result.data.products.active).toBe(15);
      
      expect(result.data.readings.pending).toBe(3);
      expect(result.data.readings.published).toBe(25);
      
      expect(result.data.appointments.today).toBe(2);
      expect(result.data.appointments.pending).toBe(8);
      
      expect(result.data.testimonials.pending).toBe(4);
    });

    it('should handle zero last month values for growth calculation', async () => {
      // Arrange
      prismaMock.order.count.mockResolvedValueOnce(10);
      prismaMock.order.count.mockResolvedValueOnce(5);
      prismaMock.order.count.mockResolvedValueOnce(0);  // lastMonthOrders = 0
      prismaMock.order.count.mockResolvedValueOnce(2);

      prismaMock.order.aggregate.mockResolvedValueOnce({ _sum: { total: 1000 } } as any);
      prismaMock.order.aggregate.mockResolvedValueOnce({ _sum: { total: 500 } } as any);
      prismaMock.order.aggregate.mockResolvedValueOnce({ _sum: { total: 0 } } as any); // lastMonthRevenue = 0

      prismaMock.user.count.mockResolvedValueOnce(10);
      prismaMock.user.count.mockResolvedValueOnce(3);

      prismaMock.product.count.mockResolvedValueOnce(5);
      prismaMock.product.count.mockResolvedValueOnce(4);

      prismaMock.reading.count.mockResolvedValueOnce(1);
      prismaMock.reading.count.mockResolvedValueOnce(5);

      prismaMock.appointment.count.mockResolvedValueOnce(0);
      prismaMock.appointment.count.mockResolvedValueOnce(2);

      prismaMock.testimonial.count.mockResolvedValueOnce(0);

      // Act
      const result = await dashboardService.getStats();

      // Assert - growth should be 0 when last month is 0
      expect(result.data.orders.growth).toBe(0);
      expect(result.data.revenue.growth).toBe(0);
    });
  });

  // =============================================
  // GET RECENT ORDERS
  // =============================================
  describe('getRecentOrders', () => {
    it('should return recent orders with client and items', async () => {
      // Arrange
      const mockOrders = [
        {
          id: 'order-1',
          orderNumber: 'ORD-001',
          total: 150,
          status: 'COMPLETED',
          paymentStatus: 'SUCCEEDED',
          createdAt: new Date('2026-01-15'),
          client: {
            id: 'user-1',
            fullName: 'Maria Silva',
            email: 'maria@email.com',
          },
          items: [
            {
              id: 'item-1',
              quantity: 1,
              product: { id: 'prod-1', name: 'Leitura Cigana' },
            },
          ],
        },
        {
          id: 'order-2',
          orderNumber: 'ORD-002',
          total: 250,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          createdAt: new Date('2026-01-14'),
          client: {
            id: 'user-2',
            fullName: 'João Santos',
            email: 'joao@email.com',
          },
          items: [],
        },
      ];
      prismaMock.order.findMany.mockResolvedValue(mockOrders as any);

      // Act
      const result = await dashboardService.getRecentOrders(5);

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.data[0].client.fullName).toBe('Maria Silva');
      expect(prismaMock.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should use default limit of 5', async () => {
      // Arrange
      prismaMock.order.findMany.mockResolvedValue([]);

      // Act
      await dashboardService.getRecentOrders();

      // Assert
      expect(prismaMock.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 })
      );
    });
  });

  // =============================================
  // GET RECENT USERS
  // =============================================
  describe('getRecentUsers', () => {
    it('should return recent client users', async () => {
      // Arrange
      const mockUsers = [
        {
          id: 'user-1',
          fullName: 'Maria Silva',
          email: 'maria@email.com',
          avatarUrl: 'https://example.com/avatar1.jpg',
          createdAt: new Date('2026-01-15'),
        },
        {
          id: 'user-2',
          fullName: 'João Santos',
          email: 'joao@email.com',
          avatarUrl: null,
          createdAt: new Date('2026-01-14'),
        },
      ];
      prismaMock.user.findMany.mockResolvedValue(mockUsers as any);

      // Act
      const result = await dashboardService.getRecentUsers(5);

      // Assert
      expect(result.data).toHaveLength(2);
      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { role: 'CLIENT' },
          take: 5,
          orderBy: { createdAt: 'desc' },
        })
      );
    });
  });

  // =============================================
  // GET SALES CHART
  // =============================================
  describe('getSalesChart', () => {
    it('should return weekly sales chart data', async () => {
      // Arrange
      const mockOrders = [
        { total: 100, createdAt: new Date() },
        { total: 200, createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      ];
      prismaMock.order.findMany.mockResolvedValue(mockOrders as any);

      // Act
      const result = await dashboardService.getSalesChart('week');

      // Assert
      expect(result.data.labels).toHaveLength(7);
      expect(result.data.datasets).toHaveLength(1);
      expect(result.data.datasets[0].label).toBe('Vendas');
    });

    it('should return monthly sales chart data', async () => {
      // Arrange
      prismaMock.order.findMany.mockResolvedValue([]);

      // Act
      const result = await dashboardService.getSalesChart('month');

      // Assert
      // Labels should have number of days in current month
      expect(result.data.labels.length).toBeGreaterThanOrEqual(28);
      expect(result.data.labels.length).toBeLessThanOrEqual(31);
    });

    it('should return yearly sales chart data', async () => {
      // Arrange
      prismaMock.order.findMany.mockResolvedValue([]);

      // Act
      const result = await dashboardService.getSalesChart('year');

      // Assert
      expect(result.data.labels).toHaveLength(12);
      expect(result.data.labels).toEqual([
        'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
      ]);
    });

    it('should aggregate order totals correctly', async () => {
      // Arrange
      const today = new Date();
      const mockOrders = [
        { total: 100, createdAt: today },
        { total: 150, createdAt: today },
      ];
      prismaMock.order.findMany.mockResolvedValue(mockOrders as any);

      // Act
      const result = await dashboardService.getSalesChart('week');

      // Assert
      // Last position (today) should have sum of 250
      expect(result.data.datasets[0].data[6]).toBe(250);
    });
  });

  // =============================================
  // GET TOP PRODUCTS
  // =============================================
  describe('getTopProducts', () => {
    it('should return top selling products', async () => {
      // Arrange
      const mockGroupedProducts = [
        { productId: 'prod-1', _sum: { quantity: 50 } },
        { productId: 'prod-2', _sum: { quantity: 30 } },
      ];
      const mockProductDetails = [
        { id: 'prod-1', name: 'Leitura Cigana', coverImageUrl: 'img1.jpg', price: 150 },
        { id: 'prod-2', name: 'Consulta Espiritual', coverImageUrl: 'img2.jpg', price: 200 },
      ];
      prismaMock.orderItem.groupBy.mockResolvedValue(mockGroupedProducts as any);
      prismaMock.product.findMany.mockResolvedValue(mockProductDetails as any);

      // Act
      const result = await dashboardService.getTopProducts(5);

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe('Leitura Cigana');
      expect(result.data[0].totalSold).toBe(50);
      expect(result.data[1].name).toBe('Consulta Espiritual');
      expect(result.data[1].totalSold).toBe(30);
    });

    it('should handle products with null quantity sum', async () => {
      // Arrange
      const mockGroupedProducts = [
        { productId: 'prod-1', _sum: { quantity: null } },
      ];
      const mockProductDetails = [
        { id: 'prod-1', name: 'Produto Teste', coverImageUrl: null, price: 100 },
      ];
      prismaMock.orderItem.groupBy.mockResolvedValue(mockGroupedProducts as any);
      prismaMock.product.findMany.mockResolvedValue(mockProductDetails as any);

      // Act
      const result = await dashboardService.getTopProducts();

      // Assert
      expect(result.data[0].totalSold).toBe(0);
    });

    it('should use default limit of 5', async () => {
      // Arrange
      prismaMock.orderItem.groupBy.mockResolvedValue([]);
      prismaMock.product.findMany.mockResolvedValue([]);

      // Act
      await dashboardService.getTopProducts();

      // Assert
      expect(prismaMock.orderItem.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 })
      );
    });
  });
});
