// apps/backend/src/modules/auth/auth.routes.ts

import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { authenticate } from '../../middlewares/auth.middleware';
import { authLimiter, passwordResetLimiter } from '../../middlewares/rateLimiter.middleware';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  refreshTokenSchema,
} from './auth.schema';

const router = Router();

// Public routes
router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  authController.register.bind(authController)
);

router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  authController.login.bind(authController)
);

router.post(
  '/forgot-password',
  passwordResetLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword.bind(authController)
);

router.post(
  '/reset-password',
  passwordResetLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword.bind(authController)
);

router.post(
  '/refresh',
  validate(refreshTokenSchema),
  authController.refreshToken.bind(authController)
);

// Protected routes
router.get(
  '/profile',
  authenticate,
  authController.getProfile.bind(authController)
);

router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword.bind(authController)
);

router.post(
  '/logout',
  authenticate,
  authController.logout.bind(authController)
);

export default router;
