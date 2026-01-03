// apps/backend/src/modules/categories/categories.routes.ts

import { Router } from 'express';
import { categoriesController } from './categories.controller';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/categories', categoriesController.findAll.bind(categoriesController));

router.get(
  '/categories/:slug',
  categoriesController.findBySlug.bind(categoriesController)
);

// Admin routes
router.get(
  '/admin/categories',
  authenticate,
  requireAdmin,
  categoriesController.findAllAdmin.bind(categoriesController)
);

router.post(
  '/admin/categories',
  authenticate,
  requireAdmin,
  categoriesController.create.bind(categoriesController)
);

router.put(
  '/admin/categories/:id',
  authenticate,
  requireAdmin,
  categoriesController.update.bind(categoriesController)
);

router.patch(
  '/admin/categories/:id',
  authenticate,
  requireAdmin,
  categoriesController.update.bind(categoriesController)
);

router.patch(
  '/admin/categories/:id/reorder',
  authenticate,
  requireAdmin,
  categoriesController.reorder.bind(categoriesController)
);

router.delete(
  '/admin/categories/:id',
  authenticate,
  requireAdmin,
  categoriesController.delete.bind(categoriesController)
);

export default router;
