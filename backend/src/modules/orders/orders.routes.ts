// apps/backend/src/modules/orders/orders.routes.ts

import { Router } from 'express';
import { ordersController } from './orders.controller';
import { validate, idParamsSchema } from '../../middlewares/validate.middleware';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware';
import { createOrderSchema, updateOrderSchema, queryOrdersSchema, addQuestionsSchema } from './orders.schema';

const router = Router();

// All routes require authentication
router.use(authenticate);

// =============================================
// CLIENT ROUTES
// =============================================

router.post(
  '/',
  validate(createOrderSchema),
  ordersController.create.bind(ordersController)
);

router.get(
  '/my',
  validate(queryOrdersSchema, 'query'),
  ordersController.listMy.bind(ordersController)
);

router.get(
  '/my/:id',
  validate(idParamsSchema, 'params'),
  ordersController.getMyById.bind(ordersController)
);

router.post(
  '/my/:id/cancel',
  validate(idParamsSchema, 'params'),
  ordersController.cancelMy.bind(ordersController)
);

router.post(
  '/items/:itemId/questions',
  validate(addQuestionsSchema),
  ordersController.addQuestions.bind(ordersController)
);

// =============================================
// ADMIN ROUTES
// =============================================

router.get(
  '/',
  requireAdmin,
  validate(queryOrdersSchema, 'query'),
  ordersController.list.bind(ordersController)
);

router.get(
  '/statistics',
  requireAdmin,
  ordersController.getStatistics.bind(ordersController)
);

router.get(
  '/:id',
  requireAdmin,
  validate(idParamsSchema, 'params'),
  ordersController.getById.bind(ordersController)
);

router.patch(
  '/:id',
  requireAdmin,
  validate(idParamsSchema, 'params'),
  validate(updateOrderSchema),
  ordersController.update.bind(ordersController)
);

router.post(
  '/:id/cancel',
  requireAdmin,
  validate(idParamsSchema, 'params'),
  ordersController.cancel.bind(ordersController)
);

export default router;
