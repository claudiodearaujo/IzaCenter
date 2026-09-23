import { NextFunction, Request, Response } from 'express';

export class TenantController {
  async getCurrent(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({
        success: true,
        data: req.tenant,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const tenantController = new TenantController();
