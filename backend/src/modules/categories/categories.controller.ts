// apps/backend/src/modules/categories/categories.controller.ts

import { Request, Response, NextFunction } from 'express';
import { categoriesService } from './categories.service';

export class CategoriesController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await categoriesService.findAll();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findAllAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await categoriesService.findAll(true); // Include inactive
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await categoriesService.findById(id as string);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const result = await categoriesService.findBySlug(slug as string);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await categoriesService.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await categoriesService.update(id as string, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async reorder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { order } = req.body;
      const result = await categoriesService.reorder(id as string, order);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await categoriesService.delete(id as string);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const categoriesController = new CategoriesController();
