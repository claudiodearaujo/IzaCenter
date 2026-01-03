// apps/backend/src/modules/users/users.controller.ts

import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service';
import { UpdateProfileDto, AdminUpdateUserDto, QueryUsersDto } from './users.schema';

export class UsersController {
  /**
   * GET /users/profile
   * Get current user profile
   */
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const user = await usersService.getById(userId);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /users/profile
   * Update current user profile
   */
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data = req.body as UpdateProfileDto;
      const user = await usersService.updateProfile(userId, data);

      res.json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /users/avatar
   * Upload user avatar
   */
  async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'Nenhum arquivo enviado',
        });
        return;
      }

      const user = await usersService.updateAvatar(userId, req.file);

      res.json({
        success: true,
        message: 'Avatar atualizado com sucesso',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /users/avatar
   * Delete user avatar
   */
  async deleteAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await usersService.deleteAvatar(userId);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /users/statistics
   * Get current user statistics
   */
  async getStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const stats = await usersService.getStatistics(userId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin routes

  /**
   * GET /users (admin)
   * List all users
   */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as QueryUsersDto;
      const result = await usersService.list(query);

      res.json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /users/:id (admin)
   * Get user by ID
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await usersService.getById(id);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /users/:id (admin)
   * Update user by ID
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body as AdminUpdateUserDto;
      const user = await usersService.adminUpdate(id, data);

      res.json({
        success: true,
        message: 'Usuário atualizado com sucesso',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /users/:id (admin)
   * Delete user by ID
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await usersService.delete(id);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /users/:id/statistics (admin)
   * Get user statistics
   */
  async getUserStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const stats = await usersService.getStatistics(id);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
