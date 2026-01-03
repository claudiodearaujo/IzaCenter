// apps/backend/src/modules/readings/readings.controller.ts

import { Request, Response, NextFunction } from 'express';
import { readingsService } from './readings.service';

export class ReadingsController {
  // Admin endpoints
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, search, page, limit } = req.query;

      const result = await readingsService.findAll({
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

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await readingsService.findById(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await readingsService.update(id, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await readingsService.updateStatus(id, status);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateAudio(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      // Handle file upload - audioUrl would come from upload middleware
      const audioUrl = req.body.audioUrl || (req.file as any)?.location;
      
      if (!audioUrl) {
        return res.status(400).json({ message: 'Audio file is required' });
      }

      const result = await readingsService.updateAudio(id, audioUrl);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await readingsService.delete(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await readingsService.getStats();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Client endpoints
  async findByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await readingsService.findByUser(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findByIdForUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const result = await readingsService.findById(id, userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const readingsController = new ReadingsController();
