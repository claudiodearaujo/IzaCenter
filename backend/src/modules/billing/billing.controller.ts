import { NextFunction, Request, Response } from 'express';
import { billingService } from './billing.service';

export class BillingController {
  getPlans(req: Request, res: Response) {
    res.json({
      success: true,
      data: billingService.getPlans(),
    });
  }

  async getCurrent(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await billingService.getCurrent(req.tenant!.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async createCheckout(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await billingService.createCheckout(
        req.tenant!.id,
        req.body.planKey
      );
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async createPortal(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await billingService.createPortal(req.tenant!.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

export const billingController = new BillingController();
