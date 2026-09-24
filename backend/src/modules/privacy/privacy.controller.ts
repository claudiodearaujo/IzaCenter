import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { auditService } from './audit.service';
import { privacyService } from './privacy.service';

function requestId(req: Request) {
  return (req as any).auditRequestId || req.headers['x-request-id']?.toString() || randomUUID();
}

export class PrivacyController {
  async export(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await privacyService.exportUserData(req.user!.id, req.tenant!.id);
      res.setHeader('Content-Disposition', 'attachment; filename="privacy-export.json"');
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  async createRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await privacyService.createRequest(req.tenant!.id, req.user!.id, req.body);
      await auditService.record({
        tenantId: req.tenant!.id,
        actorUserId: req.user!.id,
        action: 'privacy.request.created',
        resourceType: 'PrivacyRequest',
        resourceId: data.id,
        method: 'POST',
        path: '/privacy/requests',
        statusCode: 201,
        outcome: 'SUCCESS',
        requestId: requestId(req),
      });
      res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
  }

  async listMine(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await privacyService.listMine(req.tenant!.id, req.user!.id);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  async contact(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await privacyService.getPrivacyContact(req.tenant!.id);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  async updateContact(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await privacyService.updatePrivacyContact(req.tenant!.id, req.body);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  async listRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await privacyService.listRequests(req.tenant!.id, req.query as any);
      res.json({ success: true, ...data });
    } catch (error) { next(error); }
  }

  async getRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await privacyService.getRequest(req.tenant!.id, String(req.params.id));
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  async updateRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await privacyService.updateRequest(
        req.tenant!.id,
        String(req.params.id),
        req.user!.id,
        req.body,
        requestId(req)
      );
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  async audit(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await auditService.list(req.tenant!.id, req.query as any);
      res.json({ success: true, ...data });
    } catch (error) { next(error); }
  }

  async retention(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await privacyService.getRetentionPolicy(req.tenant!.id);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  async updateRetention(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await privacyService.updateRetentionPolicy(req.tenant!.id, req.body);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  async retentionReport(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await privacyService.retentionReport(req.tenant!.id);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  async listIncidents(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await privacyService.listIncidents(req.tenant!.id);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  async createIncident(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await privacyService.createIncident(req.tenant!.id, req.user!.id, req.body);
      res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
  }

  async updateIncident(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await privacyService.updateIncident(req.tenant!.id, String(req.params.id), req.body);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }
}

export const privacyController = new PrivacyController();
