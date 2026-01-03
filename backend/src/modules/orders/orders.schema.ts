// apps/backend/src/modules/orders/orders.schema.ts

import { z } from 'zod';

/**
 * Order status enum
 */
const orderStatusEnum = z.enum(['PENDING', 'PAID', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED']);

/**
 * Cart item schema
 */
const cartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
  questions: z.array(z.string()).optional(),
});

/**
 * Create order schema (from cart)
 */
export const createOrderSchema = z.object({
  items: z.array(cartItemSchema).min(1, 'Carrinho vazio'),
  clientNotes: z.string().max(1000).optional(),
  couponCode: z.string().optional(),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;

/**
 * Update order schema (admin)
 */
export const updateOrderSchema = z.object({
  status: orderStatusEnum.optional(),
  adminNotes: z.string().optional(),
});

export type UpdateOrderDto = z.infer<typeof updateOrderSchema>;

/**
 * Query orders schema
 */
export const queryOrdersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  status: orderStatusEnum.optional(),
  clientId: z.string().uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  sortBy: z.enum(['createdAt', 'total', 'status', 'orderNumber']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type QueryOrdersDto = z.infer<typeof queryOrdersSchema>;

/**
 * Add questions to order item
 */
export const addQuestionsSchema = z.object({
  questions: z.array(z.string().min(10, 'Pergunta muito curta')).min(1, 'Adicione pelo menos uma pergunta'),
});

export type AddQuestionsDto = z.infer<typeof addQuestionsSchema>;
