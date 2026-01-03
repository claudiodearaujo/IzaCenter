// apps/backend/src/modules/testimonials/testimonials.controller.ts

import { Request, Response, NextFunction } from 'express';
import { testimonialsService } from './testimonials.service';

export class TestimonialsController {
  // Public endpoints
  async findPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit } = req.query;
      const result = await testimonialsService.findPublic(
        limit ? parseInt(limit as string) : undefined
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findFeatured(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit } = req.query;
      const result = await testimonialsService.findFeatured(
        limit ? parseInt(limit as string) : undefined
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Client endpoints
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { productId, content, rating } = req.body;

      const result = await testimonialsService.create({
        userId,
        productId,
        content,
        rating,
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  // Admin endpoints
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, search, page, limit } = req.query;

      const result = await testimonialsService.findAll({
        status: status as string,
        search: search as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await testimonialsService.update(id, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await testimonialsService.delete(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await testimonialsService.getStats();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const testimonialsController = new TestimonialsController();
