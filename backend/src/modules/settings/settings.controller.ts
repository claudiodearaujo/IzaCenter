// apps/backend/src/modules/settings/settings.controller.ts

import { Request, Response, NextFunction } from 'express';
import { settingsService } from './settings.service';

export class SettingsController {
  // Public endpoint
  async getPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.getPublic(req.tenant?.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Admin endpoints
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.getAll(req.tenant?.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getGeneral(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.getGeneral(req.tenant?.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateGeneral(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.updateGeneral(req.body, req.tenant?.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getContact(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.getContact(req.tenant?.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateContact(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.updateContact(req.body, req.tenant?.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getBusinessHours(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.getBusinessHours(req.tenant?.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateBusinessHours(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.updateBusinessHours(req.body, req.tenant?.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getContent(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.getContent(req.tenant?.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateContent(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.updateContent(req.body, req.tenant?.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getProfessional(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.getProfessional(req.tenant?.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateProfessional(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.updateProfessional(req.body, req.tenant?.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getSpecialties(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.getSpecialties(req.tenant?.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateSpecialties(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.updateSpecialties(req.body, req.tenant?.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getSeo(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.getSeo(req.tenant?.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateSeo(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.updateSeo(req.body, req.tenant?.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.getAnalytics(req.tenant?.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await settingsService.updateAnalytics(req.body, req.tenant?.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const settingsController = new SettingsController();
