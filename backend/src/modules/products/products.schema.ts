// apps/backend/src/modules/products/products.schema.ts

import { z } from 'zod';
import { commonSchemas } from '../../middlewares/validate.middleware';

/**
 * Product type enum
 */
const productTypeEnum = z.enum(['QUESTION', 'SESSION', 'MONTHLY', 'SPECIAL']);

/**
 * Create product schema
 */
export const createProductSchema = z.object({
  categoryId: z.string().uuid().optional(),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(200),
  slug: commonSchemas.slug.optional(),
  shortDescription: z.string().max(300).optional(),
  fullDescription: z.string().optional(),
  productType: productTypeEnum,
  price: z.coerce.number().positive('Preço deve ser positivo'),
  originalPrice: z.coerce.number().positive().optional(),
  numQuestions: z.coerce.number().int().positive().optional(),
  sessionDurationMinutes: z.coerce.number().int().positive().optional(),
  numCards: z.coerce.number().int().positive().optional(),
  validityDays: z.coerce.number().int().positive().default(365),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  requiresScheduling: z.boolean().default(false),
  maxPerClient: z.coerce.number().int().positive().optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  availableFrom: z.coerce.date().optional(),
  availableUntil: z.coerce.date().optional(),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;

/**
 * Update product schema
 */
export const updateProductSchema = createProductSchema.partial();

export type UpdateProductDto = z.infer<typeof updateProductSchema>;

/**
 * Query products schema
 */
export const queryProductsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  productType: productTypeEnum.optional(),
  isActive: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sortBy: z.enum(['createdAt', 'name', 'price', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type QueryProductsDto = z.infer<typeof queryProductsSchema>;

/**
 * Create category schema
 */
export const createCategorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: commonSchemas.slug.optional(),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
  displayOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;

/**
 * Update category schema
 */
export const updateCategorySchema = createCategorySchema.partial();

export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;
