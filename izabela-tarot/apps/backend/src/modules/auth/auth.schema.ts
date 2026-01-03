// apps/backend/src/modules/auth/auth.schema.ts

import { z } from 'zod';
import { commonSchemas } from '../../middlewares/validate.middleware';

/**
 * Register schema
 */
export const registerSchema = z.object({
  email: commonSchemas.email,
  password: commonSchemas.password,
  fullName: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  phone: commonSchemas.phone,
  birthDate: z.coerce.date().optional(),
});

export type RegisterDto = z.infer<typeof registerSchema>;

/**
 * Login schema
 */
export const loginSchema = z.object({
  email: commonSchemas.email,
  password: z.string().min(1, 'Senha é obrigatória'),
});

export type LoginDto = z.infer<typeof loginSchema>;

/**
 * Forgot password schema
 */
export const forgotPasswordSchema = z.object({
  email: commonSchemas.email,
});

export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset password schema
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  password: commonSchemas.password,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;

/**
 * Change password schema
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: commonSchemas.password,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;

/**
 * Refresh token schema
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
});

export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;
