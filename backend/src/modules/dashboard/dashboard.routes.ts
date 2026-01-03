// apps/backend/src/modules/dashboard/dashboard.routes.ts

import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware';

const router = Router();

// All dashboard routes require admin authentication
router.use('/admin/dashboard', authenticate, requireAdmin);

router.get(
  '/admin/dashboard/stats',
  dashboardController.getStats.bind(dashboardController)
);

router.get(
  '/admin/dashboard/recent-orders',
  dashboardController.getRecentOrders.bind(dashboardController)
);

router.get(
  '/admin/dashboard/recent-users',
  dashboardController.getRecentUsers.bind(dashboardController)
);

router.get(
  '/admin/dashboard/sales-chart',
  dashboardController.getSalesChart.bind(dashboardController)
);

router.get(
  '/admin/dashboard/top-products',
  dashboardController.getTopProducts.bind(dashboardController)
);

export default router;
