// apps/backend/src/modules/settings/settings.controller.ts

import { Request, Response, NextFunction } from 'express';
import { settingsService } from './settings.service';

export class SettingsController {
  // Public endpoint
  async getPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.getPublic();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Admin endpoints
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.getAll();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getGeneral(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.getGeneral();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateGeneral(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.updateGeneral(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getContact(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.getContact();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateContact(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.updateContact(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getBusinessHours(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.getBusinessHours();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateBusinessHours(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.updateBusinessHours(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getContent(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.getContent();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateContent(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.updateContent(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.getAnalytics();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.updateAnalytics(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const settingsController = new SettingsController();
