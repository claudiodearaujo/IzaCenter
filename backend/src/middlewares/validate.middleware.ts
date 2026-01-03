// apps/backend/src/middlewares/validate.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Middleware factory for request validation using Zod schemas
 */
export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dataToValidate = req[target];
      const validatedData = await schema.parseAsync(dataToValidate);
      
      // Replace with validated data
      req[target] = validatedData;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.issues.map((err: z.ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(422).json({
          success: false,
          message: 'Erro de validação',
          code: 'VALIDATION_ERROR',
          errors: formattedErrors,
        });
        return;
      }

      next(error);
    }
  };
}

/**
 * Common validation schemas
 */
export const commonSchemas = {
  // UUID validation
  uuid: z.string().uuid('ID inválido'),
  
  // Email validation
  email: z.string().email('Email inválido').toLowerCase(),
  
  // Password validation
  password: z.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter ao menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter ao menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter ao menos um número'),
  
  // Phone validation (Brazilian format)
  phone: z.string()
    .regex(/^\+?[1-9]\d{10,14}$/, 'Telefone inválido')
    .optional(),
  
  // Pagination params
  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
  
  // Date range filter
  dateRange: z.object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  }),
  
  // Brazilian CPF (optional validation)
  cpf: z.string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/, 'CPF inválido')
    .optional(),
  
  // Slug validation
  slug: z.string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido')
    .min(2, 'Slug muito curto')
    .max(100, 'Slug muito longo'),
};

/**
 * ID params validation schema
 */
export const idParamsSchema = z.object({
  id: commonSchemas.uuid,
});

/**
 * Pagination query schema
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
