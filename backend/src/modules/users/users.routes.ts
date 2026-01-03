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

// Client routes
router.get('/profile', usersController.getProfile.bind(usersController));
router.patch('/profile', validate(updateProfileSchema), usersController.updateProfile.bind(usersController));
router.post('/avatar', uploadImage.single('avatar'), usersController.uploadAvatar.bind(usersController));
router.delete('/avatar', usersController.deleteAvatar.bind(usersController));
router.get('/statistics', usersController.getStatistics.bind(usersController));

// Admin routes
router.get(
  '/',
  requireAdmin,
  validate(queryUsersSchema, 'query'),
  usersController.list.bind(usersController)
);

router.get(
  '/:id',
  requireAdmin,
  validate(idParamsSchema, 'params'),
  usersController.getById.bind(usersController)
);

router.patch(
  '/:id',
  requireAdmin,
  validate(idParamsSchema, 'params'),
  validate(adminUpdateUserSchema),
  usersController.update.bind(usersController)
);

router.delete(
  '/:id',
  requireAdmin,
  validate(idParamsSchema, 'params'),
  usersController.delete.bind(usersController)
);

router.get(
  '/:id/statistics',
  requireAdmin,
  validate(idParamsSchema, 'params'),
  usersController.getUserStatistics.bind(usersController)
);

export default router;
