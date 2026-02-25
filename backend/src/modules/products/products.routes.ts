// apps/backend/src/modules/products/products.routes.ts

import { Router } from 'express';
import { productsController } from './products.controller';
import { validate, idParamsSchema } from '../../middlewares/validate.middleware';
import { authenticate, requireAdmin, optionalAuth } from '../../middlewares/auth.middleware';
import { uploadImage, compressImageMiddleware } from '../../middlewares/upload.middleware';
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

/**
 * @openapi
 * /products/public:
 *   get:
 *     tags: [Products]
 *     summary: List active products (public)
 *     security: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or description
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: productType
 *         schema:
 *           type: string
 *           enum: [QUESTION, SESSION, MONTHLY, SPECIAL]
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *     responses:
 *       200:
 *         description: List of active products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 */
router.get(
  '/public',
  validate(queryProductsSchema, 'query'),
  productsController.listPublic.bind(productsController)
);

/**
 * @openapi
 * /products/public/featured:
 *   get:
 *     tags: [Products]
 *     summary: Get featured products (public)
 *     security: []
 *     responses:
 *       200:
 *         description: Featured products
 */
router.get(
  '/public/featured',
  productsController.getFeatured.bind(productsController)
);

/**
 * @openapi
 * /products/public/cursor:
 *   get:
 *     tags: [Products]
 *     summary: List active products with cursor-based pagination (public)
 *     description: More efficient than offset pagination for large datasets.
 *     security: []
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Cursor ID from the previous page's nextCursor
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Products with cursor pagination metadata
 */
router.get(
  '/public/cursor',
  productsController.listCursor.bind(productsController)
);

/**
 * @openapi
 * /products/public/{slug}:
 *   get:
 *     tags: [Products]
 *     summary: Get a product by slug (public)
 *     security: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.get(
  '/public/:slug',
  productsController.getBySlug.bind(productsController)
);

/**
 * @openapi
 * /products/categories/public:
 *   get:
 *     tags: [Categories]
 *     summary: List active product categories (public)
 *     security: []
 *     responses:
 *       200:
 *         description: List of active categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductCategory'
 */
router.get(
  '/categories/public',
  productsController.listCategoriesPublic.bind(productsController)
);

// =============================================
// ADMIN ROUTES
// =============================================

/**
 * @openapi
 * /products:
 *   post:
 *     tags: [Products]
 *     summary: Create a new product (admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created
 *       403:
 *         description: Admin access required
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createProductSchema),
  productsController.create.bind(productsController)
);

/**
 * @openapi
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: List all products (admin)
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
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated list of products
 */
router.get(
  '/',
  authenticate,
  requireAdmin,
  validate(queryProductsSchema, 'query'),
  productsController.list.bind(productsController)
);

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by ID (admin)
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
 *         description: Product details
 *       404:
 *         description: Product not found
 */
router.get(
  '/:id',
  authenticate,
  requireAdmin,
  validate(idParamsSchema, 'params'),
  productsController.getById.bind(productsController)
);

/**
 * @openapi
 * /products/{id}:
 *   patch:
 *     tags: [Products]
 *     summary: Update a product (admin)
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
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated
 *       404:
 *         description: Product not found
 */
router.patch(
  '/:id',
  authenticate,
  requireAdmin,
  validate(idParamsSchema, 'params'),
  validate(updateProductSchema),
  productsController.update.bind(productsController)
);

/**
 * @openapi
 * /products/{id}/cover:
 *   post:
 *     tags: [Products]
 *     summary: Upload product cover image (admin)
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               cover:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Cover image updated
 */
router.post(
  '/:id/cover',
  authenticate,
  requireAdmin,
  validate(idParamsSchema, 'params'),
  uploadImage.single('cover'),
  compressImageMiddleware({ maxWidthOrHeight: 1200, quality: 85, format: 'webp' }),
  productsController.updateCover.bind(productsController)
);

/**
 * @openapi
 * /products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Delete a product (admin)
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
 *         description: Product deleted
 *       404:
 *         description: Product not found
 */
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  validate(idParamsSchema, 'params'),
  productsController.delete.bind(productsController)
);

// Categories
/**
 * @openapi
 * /products/categories:
 *   post:
 *     tags: [Categories]
 *     summary: Create a product category (admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductCategory'
 *     responses:
 *       201:
 *         description: Category created
 */
router.post(
  '/categories',
  authenticate,
  requireAdmin,
  validate(createCategorySchema),
  productsController.createCategory.bind(productsController)
);

/**
 * @openapi
 * /products/categories:
 *   get:
 *     tags: [Categories]
 *     summary: List all product categories (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get(
  '/categories',
  authenticate,
  requireAdmin,
  productsController.listCategories.bind(productsController)
);

/**
 * @openapi
 * /products/categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Get category by ID (admin)
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
 *         description: Category details
 *       404:
 *         description: Category not found
 */
router.get(
  '/categories/:id',
  authenticate,
  requireAdmin,
  validate(idParamsSchema, 'params'),
  productsController.getCategoryById.bind(productsController)
);

/**
 * @openapi
 * /products/categories/{id}:
 *   patch:
 *     tags: [Categories]
 *     summary: Update a category (admin)
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
 *             $ref: '#/components/schemas/ProductCategory'
 *     responses:
 *       200:
 *         description: Category updated
 */
router.patch(
  '/categories/:id',
  authenticate,
  requireAdmin,
  validate(idParamsSchema, 'params'),
  validate(updateCategorySchema),
  productsController.updateCategory.bind(productsController)
);

/**
 * @openapi
 * /products/categories/{id}:
 *   delete:
 *     tags: [Categories]
 *     summary: Delete a category (admin)
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
 *         description: Category deleted
 */
router.delete(
  '/categories/:id',
  authenticate,
  requireAdmin,
  validate(idParamsSchema, 'params'),
  productsController.deleteCategory.bind(productsController)
);

export default router;
