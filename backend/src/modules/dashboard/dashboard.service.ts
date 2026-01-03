// apps/backend/src/modules/dashboard/dashboard.service.ts

import { prisma } from '../../config/database';

export class DashboardService {
  async getStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get current month orders
    const [
      totalOrders,
      thisMonthOrders,
      lastMonthOrders,
      pendingOrders,
      totalRevenue,
      thisMonthRevenue,
      lastMonthRevenue,
      totalUsers,
      newUsersThisMonth,
      totalProducts,
      activeProducts,
      pendingReadings,
      publishedReadings,
      todayAppointments,
      pendingAppointments,
      pendingTestimonials,
    ] = await Promise.all([
      // Orders
      prisma.order.count(),
      prisma.order.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      prisma.order.count({
        where: {
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),
      prisma.order.count({ where: { status: 'PENDING' } }),

      // Revenue
      prisma.order.aggregate({
        where: { paymentStatus: 'SUCCEEDED' },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: {
          paymentStatus: 'SUCCEEDED',
          createdAt: { gte: startOfMonth },
        },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: {
          paymentStatus: 'SUCCEEDED',
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        _sum: { total: true },
      }),

      // Users
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.user.count({
        where: {
          role: 'CLIENT',
          createdAt: { gte: startOfMonth },
        },
      }),

      // Products
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),

      // Readings
      prisma.reading.count({ where: { status: 'PENDING' } }),
      prisma.reading.count({ where: { status: 'PUBLISHED' } }),

      // Appointments
      prisma.appointment.count({
        where: {
          scheduledDate: {
            gte: startOfToday,
            lt: new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.appointment.count({ where: { status: 'SCHEDULED' } }),

      // Testimonials
      prisma.testimonial.count({ where: { isApproved: false } }),
    ]);

    // Calculate growth percentages
    const ordersGrowth = lastMonthOrders > 0
      ? ((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100
      : 0;

    const thisMonthRevenueValue = Number(thisMonthRevenue._sum?.total || 0);
    const lastMonthRevenueValue = Number(lastMonthRevenue._sum?.total || 0);
    const revenueGrowth = lastMonthRevenueValue > 0
      ? ((thisMonthRevenueValue - lastMonthRevenueValue) / lastMonthRevenueValue) * 100
      : 0;

    return {
      data: {
        orders: {
          total: totalOrders,
          thisMonth: thisMonthOrders,
          pending: pendingOrders,
          growth: ordersGrowth,
        },
        revenue: {
          total: Number(totalRevenue._sum?.total || 0),
          thisMonth: thisMonthRevenueValue,
          growth: revenueGrowth,
        },
        users: {
          total: totalUsers,
          newThisMonth: newUsersThisMonth,
        },
        products: {
          total: totalProducts,
          active: activeProducts,
        },
        readings: {
          pending: pendingReadings,
          published: publishedReadings,
        },
        appointments: {
          today: todayAppointments,
          pending: pendingAppointments,
        },
        testimonials: {
          pending: pendingTestimonials,
        },
      },
    };
  }

  async getRecentOrders(limit = 5) {
    const orders = await prisma.order.findMany({
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return { data: orders };
  }

  async getRecentUsers(limit = 5) {
    const users = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return { data: users };
  }

  async getSalesChart(period: 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    let startDate: Date;
    let groupBy: string;
    let labels: string[] = [];

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupBy = 'day';
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          labels.push(d.toLocaleDateString('pt-BR', { weekday: 'short' }));
        }
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        groupBy = 'day';
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
          labels.push(i.toString());
        }
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        groupBy = 'month';
        labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        break;
    }

    const orders = await prisma.order.findMany({
      where: {
        paymentStatus: 'SUCCEEDED',
        createdAt: { gte: startDate },
      },
      select: {
        total: true,
        createdAt: true,
      },
    });

    // Aggregate by period
    const data: number[] = new Array(labels.length).fill(0);

    orders.forEach((order) => {
      let index: number;
      const orderDate = new Date(order.createdAt);

      switch (period) {
        case 'week':
          const daysDiff = Math.floor(
            (now.getTime() - orderDate.getTime()) / (24 * 60 * 60 * 1000)
          );
          index = 6 - daysDiff;
          break;
        case 'month':
          index = orderDate.getDate() - 1;
          break;
        case 'year':
          index = orderDate.getMonth();
          break;
      }

      if (index >= 0 && index < data.length) {
        data[index] += Number(order.total);
      }
    });

    return {
      data: {
        labels,
        datasets: [
          {
            label: 'Vendas',
            data,
          },
        ],
      },
    };
  }

  async getTopProducts(limit = 5) {
    const products = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });

    const productIds = products.map((p: { productId: string }) => p.productId);
    const productDetails = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        coverImageUrl: true,
        price: true,
      },
    });

    const result = products.map((p: { productId: string; _sum: { quantity: number | null } }) => {
      const product = productDetails.find((pd: { id: string }) => pd.id === p.productId);
      return {
        ...product,
        totalSold: p._sum.quantity || 0,
      };
    });

    return { data: result };
  }
}

export const dashboardService = new DashboardService();
