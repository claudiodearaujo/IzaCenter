// apps/backend/src/modules/users/users.schema.ts

import { z } from 'zod';
import { commonSchemas } from '../../middlewares/validate.middleware';

/**
 * Update profile schema
 */
export const updateProfileSchema = z.object({
  fullName: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .optional(),
  phone: commonSchemas.phone,
  birthDate: z.coerce.date().optional(),
  preferredLanguage: z.string().optional(),
  notificationEmail: z.boolean().optional(),
  notificationWhatsapp: z.boolean().optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;

/**
 * Admin update user schema
 */
export const adminUpdateUserSchema = z.object({
  fullName: z.string().min(3).max(100).optional(),
  phone: commonSchemas.phone,
  birthDate: z.coerce.date().optional(),
  role: z.enum(['CLIENT', 'ADMIN']).optional(),
  notes: z.string().optional(),
  notificationEmail: z.boolean().optional(),
  notificationWhatsapp: z.boolean().optional(),
});

export type AdminUpdateUserDto = z.infer<typeof adminUpdateUserSchema>;

/**
 * Query users schema
 */
export const queryUsersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  role: z.enum(['CLIENT', 'ADMIN']).optional(),
  sortBy: z.enum(['createdAt', 'fullName', 'email', 'lastLoginAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type QueryUsersDto = z.infer<typeof queryUsersSchema>;
