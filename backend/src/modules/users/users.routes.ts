// apps/backend/src/modules/users/users.routes.ts

import { Router } from 'express';
import { usersController } from './users.controller';
import { validate } from '../../middlewares/validate.middleware';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware';
import { uploadImage } from '../../middlewares/upload.middleware';
import { idParamsSchema, paginationQuerySchema } from '../../middlewares/validate.middleware';
import { updateProfileSchema, adminUpdateUserSchema, queryUsersSchema } from './users.schema';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @openapi
 * /users/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get('/profile', usersController.getProfile.bind(usersController));

/**
 * @openapi
 * /users/profile:
 *   patch:
 *     tags: [Users]
 *     summary: Update current user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.patch('/profile', validate(updateProfileSchema), usersController.updateProfile.bind(usersController));

/**
 * @openapi
 * /users/avatar:
 *   post:
 *     tags: [Users]
 *     summary: Upload user avatar
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded
 */
router.post('/avatar', uploadImage.single('avatar'), usersController.uploadAvatar.bind(usersController));

/**
 * @openapi
 * /users/avatar:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user avatar
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Avatar deleted
 */
router.delete('/avatar', usersController.deleteAvatar.bind(usersController));

/**
 * @openapi
 * /users/statistics:
 *   get:
 *     tags: [Users]
 *     summary: Get current user statistics (orders, readings, appointments)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics
 */
router.get('/statistics', usersController.getStatistics.bind(usersController));

/**
 * @openapi
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: List all users (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [CLIENT, ADMIN]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paginated list of users
 */
router.get(
  '/',
  requireAdmin,
  validate(queryUsersSchema, 'query'),
  usersController.list.bind(usersController)
);

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID (admin)
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
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.get(
  '/:id',
  requireAdmin,
  validate(idParamsSchema, 'params'),
  usersController.getById.bind(usersController)
);

/**
 * @openapi
 * /users/{id}:
 *   patch:
 *     tags: [Users]
 *     summary: Update a user (admin)
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
 *               role:
 *                 type: string
 *                 enum: [CLIENT, ADMIN]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated
 */
router.patch(
  '/:id',
  requireAdmin,
  validate(idParamsSchema, 'params'),
  validate(adminUpdateUserSchema),
  usersController.update.bind(usersController)
);

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete a user (admin)
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
 *         description: User deleted
 */
router.delete(
  '/:id',
  requireAdmin,
  validate(idParamsSchema, 'params'),
  usersController.delete.bind(usersController)
);

/**
 * @openapi
 * /users/{id}/statistics:
 *   get:
 *     tags: [Users]
 *     summary: Get a user's statistics (admin)
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
 *         description: User statistics
 */
router.get(
  '/:id/statistics',
  requireAdmin,
  validate(idParamsSchema, 'params'),
  usersController.getUserStatistics.bind(usersController)
);

export default router;
