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

/**
 * @openapi
 * /orders:
 *   post:
 *     tags: [Orders]
 *     summary: Create a new order (checkout)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *               couponCode:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created and Stripe session returned
 *       400:
 *         description: Validation error or product unavailable
 */
router.post(
  '/',
  validate(createOrderSchema),
  ordersController.create.bind(ordersController)
);

/**
 * @openapi
 * /orders/my:
 *   get:
 *     tags: [Orders]
 *     summary: List current client orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PAID, PROCESSING, COMPLETED, CANCELLED, REFUNDED]
 *     responses:
 *       200:
 *         description: Paginated list of client orders
 */
router.get(
  '/my',
  validate(queryOrdersSchema, 'query'),
  ordersController.listMy.bind(ordersController)
);

/**
 * @openapi
 * /orders/my/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get a specific client order by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 */
router.get(
  '/my/:id',
  validate(idParamsSchema, 'params'),
  ordersController.getMyById.bind(ordersController)
);

/**
 * @openapi
 * /orders/my/{id}/cancel:
 *   post:
 *     tags: [Orders]
 *     summary: Cancel a pending order (client)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Order cancelled
 *       400:
 *         description: Order cannot be cancelled (already paid/completed)
 */
router.post(
  '/my/:id/cancel',
  validate(idParamsSchema, 'params'),
  ordersController.cancelMy.bind(ordersController)
);

/**
 * @openapi
 * /orders/items/{itemId}/questions:
 *   post:
 *     tags: [Orders]
 *     summary: Add questions to a tarot reading order item
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [questions]
 *             properties:
 *               questions:
 *                 type: string
 *     responses:
 *       200:
 *         description: Questions added
 */
router.post(
  '/items/:itemId/questions',
  validate(addQuestionsSchema),
  ordersController.addQuestions.bind(ordersController)
);

// =============================================
// ADMIN ROUTES
// =============================================

/**
 * @openapi
 * /orders:
 *   get:
 *     tags: [Orders]
 *     summary: List all orders (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated list of all orders
 */
router.get(
  '/',
  requireAdmin,
  validate(queryOrdersSchema, 'query'),
  ordersController.list.bind(ordersController)
);

/**
 * @openapi
 * /orders/statistics:
 *   get:
 *     tags: [Orders]
 *     summary: Get order statistics (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order statistics
 */
router.get(
  '/statistics',
  requireAdmin,
  ordersController.getStatistics.bind(ordersController)
);

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get order by ID (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 */
router.get(
  '/:id',
  requireAdmin,
  validate(idParamsSchema, 'params'),
  ordersController.getById.bind(ordersController)
);

/**
 * @openapi
 * /orders/{id}:
 *   patch:
 *     tags: [Orders]
 *     summary: Update order status or admin notes (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, PAID, PROCESSING, COMPLETED, CANCELLED, REFUNDED]
 *               adminNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order updated
 */
router.patch(
  '/:id',
  requireAdmin,
  validate(idParamsSchema, 'params'),
  validate(updateOrderSchema),
  ordersController.update.bind(ordersController)
);

/**
 * @openapi
 * /orders/{id}/cancel:
 *   post:
 *     tags: [Orders]
 *     summary: Cancel an order (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Order cancelled
 */
router.post(
  '/:id/cancel',
  requireAdmin,
  validate(idParamsSchema, 'params'),
  ordersController.cancel.bind(ordersController)
);

export default router;
