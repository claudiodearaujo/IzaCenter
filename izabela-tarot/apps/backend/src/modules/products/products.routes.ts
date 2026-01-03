// apps/backend/src/modules/products/products.routes.ts

import { Router } from 'express';
import { productsController } from './products.controller';
import { validate, idParamsSchema } from '../../middlewares/validate.middleware';
import { authenticate, requireAdmin, optionalAuth } from '../../middlewares/auth.middleware';
import { uploadImage } from '../../middlewares/upload.middleware';
import {
  createProductSchema,
  updateProductSchema,
  queryProductsSchema,
  createCategorySchema,
  updateCategorySchema,
} from './products.schema';

const router = Router();

// =============================================
// PUBLIC ROUTES
// =============================================

router.get(
  '/public',
  validate(queryProductsSchema, 'query'),
  productsController.listPublic.bind(productsController)
);

router.get(
  '/public/featured',
  productsController.getFeatured.bind(productsController)
);

router.get(
  '/public/:slug',
  productsController.getBySlug.bind(productsController)
);

router.get(
  '/categories/public',
  productsController.listCategoriesPublic.bind(productsController)
);

// =============================================
// ADMIN ROUTES
// =============================================

// Products
router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createProductSchema),
  productsController.create.bind(productsController)
);

router.get(
  '/',
  authenticate,
  requireAdmin,
  validate(queryProductsSchema, 'query'),
  productsController.list.bind(productsController)
);

router.get(
  '/:id',
  authenticate,
  requireAdmin,
  validate(idParamsSchema, 'params'),
  productsController.getById.bind(productsController)
);

router.patch(
  '/:id',
  authenticate,
  requireAdmin,
  validate(idParamsSchema, 'params'),
  validate(updateProductSchema),
  productsController.update.bind(productsController)
);

router.post(
  '/:id/cover',
  authenticate,
  requireAdmin,
  validate(idParamsSchema, 'params'),
  uploadImage.single('cover'),
  productsController.updateCover.bind(productsController)
);

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  validate(idParamsSchema, 'params'),
  productsController.delete.bind(productsController)
);

// Categories
router.post(
  '/categories',
  authenticate,
  requireAdmin,
  validate(createCategorySchema),
  productsController.createCategory.bind(productsController)
);

router.get(
  '/categories',
  authenticate,
  requireAdmin,
  productsController.listCategories.bind(productsController)
);

router.get(
  '/categories/:id',
  authenticate,
  requireAdmin,
  validate(idParamsSchema, 'params'),
  productsController.getCategoryById.bind(productsController)
);

router.patch(
  '/categories/:id',
  authenticate,
  requireAdmin,
  validate(idParamsSchema, 'params'),
  validate(updateCategorySchema),
  productsController.updateCategory.bind(productsController)
);

router.delete(
  '/categories/:id',
  authenticate,
  requireAdmin,
  validate(idParamsSchema, 'params'),
  productsController.deleteCategory.bind(productsController)
);

export default router;
