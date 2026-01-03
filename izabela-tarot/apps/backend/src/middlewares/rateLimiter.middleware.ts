// apps/backend/src/middlewares/rateLimiter.middleware.ts

import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

/**
 * General API rate limiter
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.isProduction ? 100 : 1000, // limit each IP
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente em alguns minutos.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Auth routes rate limiter (more strict)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.isProduction ? 10 : 100, // limit each IP
  message: {
    success: false,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

/**
 * Password reset rate limiter
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: env.isProduction ? 5 : 50, // limit each IP
  message: {
    success: false,
    message: 'Muitas solicitações de redefinição de senha. Tente novamente em 1 hora.',
    code: 'PASSWORD_RESET_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * File upload rate limiter
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: env.isProduction ? 50 : 500, // limit each IP
  message: {
    success: false,
    message: 'Limite de uploads atingido. Tente novamente em 1 hora.',
    code: 'UPLOAD_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
