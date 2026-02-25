// apps/backend/src/modules/dashboard/dashboard.routes.ts

import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware';

const router = Router();

// All dashboard routes require admin authentication
router.use('/admin/dashboard', authenticate, requireAdmin);

/**
 * @openapi
 * /admin/dashboard/stats:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get dashboard summary statistics (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats (orders, revenue, users, pending items)
 */
router.get(
  '/admin/dashboard/stats',
  dashboardController.getStats.bind(dashboardController)
);

/**
 * @openapi
 * /admin/dashboard/recent-orders:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get recent orders (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: Recent orders list
 */
router.get(
  '/admin/dashboard/recent-orders',
  dashboardController.getRecentOrders.bind(dashboardController)
);

/**
 * @openapi
 * /admin/dashboard/recent-users:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get recently registered users (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: Recent users list
 */
router.get(
  '/admin/dashboard/recent-users',
  dashboardController.getRecentUsers.bind(dashboardController)
);

/**
 * @openapi
 * /admin/dashboard/sales-chart:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get sales chart data (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, year]
 *           default: month
 *     responses:
 *       200:
 *         description: Chart data with labels and datasets
 */
router.get(
  '/admin/dashboard/sales-chart',
  dashboardController.getSalesChart.bind(dashboardController)
);

/**
 * @openapi
 * /admin/dashboard/top-products:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get top selling products (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: Top products by sales
 */
router.get(
  '/admin/dashboard/top-products',
  dashboardController.getTopProducts.bind(dashboardController)
);

export default router;
