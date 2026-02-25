// apps/backend/src/modules/testimonials/testimonials.routes.ts

import { Router } from 'express';
import { testimonialsController } from './testimonials.controller';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware';

const router = Router();

/**
 * @openapi
 * /testimonials:
 *   get:
 *     tags: [Testimonials]
 *     summary: List approved testimonials (public)
 *     security: []
 *     responses:
 *       200:
 *         description: List of approved testimonials
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Testimonial'
 */
router.get(
  '/testimonials',
  testimonialsController.findPublic.bind(testimonialsController)
);

/**
 * @openapi
 * /testimonials/featured:
 *   get:
 *     tags: [Testimonials]
 *     summary: List featured testimonials (public)
 *     security: []
 *     responses:
 *       200:
 *         description: Featured testimonials
 */
router.get(
  '/testimonials/featured',
  testimonialsController.findFeatured.bind(testimonialsController)
);

/**
 * @openapi
 * /testimonials:
 *   post:
 *     tags: [Testimonials]
 *     summary: Submit a testimonial (client)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content, rating]
 *             properties:
 *               content:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               clientName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Testimonial submitted (pending approval)
 */
router.post(
  '/testimonials',
  authenticate,
  testimonialsController.create.bind(testimonialsController)
);

/**
 * @openapi
 * /admin/testimonials:
 *   get:
 *     tags: [Testimonials]
 *     summary: List all testimonials (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isApproved
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paginated list of testimonials
 */
router.get(
  '/admin/testimonials',
  authenticate,
  requireAdmin,
  testimonialsController.findAll.bind(testimonialsController)
);

/**
 * @openapi
 * /admin/testimonials/stats:
 *   get:
 *     tags: [Testimonials]
 *     summary: Get testimonial statistics (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Testimonial statistics
 */
router.get(
  '/admin/testimonials/stats',
  authenticate,
  requireAdmin,
  testimonialsController.getStats.bind(testimonialsController)
);

/**
 * @openapi
 * /admin/testimonials/{id}:
 *   patch:
 *     tags: [Testimonials]
 *     summary: Approve or feature a testimonial (admin)
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
 *               isApproved:
 *                 type: boolean
 *               isFeatured:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Testimonial updated
 */
router.patch(
  '/admin/testimonials/:id',
  authenticate,
  requireAdmin,
  testimonialsController.update.bind(testimonialsController)
);

/**
 * @openapi
 * /admin/testimonials/{id}:
 *   delete:
 *     tags: [Testimonials]
 *     summary: Delete a testimonial (admin)
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
 *         description: Testimonial deleted
 */
router.delete(
  '/admin/testimonials/:id',
  authenticate,
  requireAdmin,
  testimonialsController.delete.bind(testimonialsController)
);

export default router;
