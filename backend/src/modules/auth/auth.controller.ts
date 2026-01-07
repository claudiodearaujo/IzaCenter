// apps/backend/src/modules/auth/auth.controller.ts

import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  RefreshTokenDto,
} from './auth.schema';

export class AuthController {
  /**
   * POST /auth/register
   * Register a new user
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as RegisterDto;
      const result = await authService.register(data);

      res.status(201).json({
        success: true,
        message: 'Cadastro realizado com sucesso',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/login
   * Login user
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as LoginDto;
      const result = await authService.login(data);

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/forgot-password
   * Request password reset
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as ForgotPasswordDto;
      const result = await authService.forgotPassword(data);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/reset-password
   * Reset password with token
   */
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as ResetPasswordDto;
      const result = await authService.resetPassword(data);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/change-password
   * Change password (authenticated)
   */
  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data = req.body as ChangePasswordDto;
      const result = await authService.changePassword(userId, data);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/refresh
   * Refresh access token
   */
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body as RefreshTokenDto;
      const result = await authService.refreshToken(refreshToken);

      res.json({
        success: true,
        message: 'Token atualizado com sucesso',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /auth/profile
   * Get current user profile
   */
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const user = await authService.getProfile(userId);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/logout
   * Logout user (blacklist token)
   */
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'Token de autenticação não fornecido',
        });
        return;
      }

      const token = authHeader.split(' ')[1];

      // Blacklist the token
      const result = await authService.logout(token);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
