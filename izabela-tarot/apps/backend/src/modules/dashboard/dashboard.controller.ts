// apps/backend/src/modules/dashboard/dashboard.controller.ts

import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service';

export class DashboardController {
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await dashboardService.getStats();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getRecentOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit } = req.query;
      const result = await dashboardService.getRecentOrders(
        limit ? parseInt(limit as string) : undefined
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getRecentUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit } = req.query;
      const result = await dashboardService.getRecentUsers(
        limit ? parseInt(limit as string) : undefined
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getSalesChart(req: Request, res: Response, next: NextFunction) {
    try {
      const { period } = req.query;
      const result = await dashboardService.getSalesChart(
        period as 'week' | 'month' | 'year'
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getTopProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit } = req.query;
      const result = await dashboardService.getTopProducts(
        limit ? parseInt(limit as string) : undefined
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
