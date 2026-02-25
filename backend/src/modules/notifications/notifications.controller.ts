// apps/backend/src/modules/notifications/notifications.controller.ts

import { Request, Response, NextFunction } from 'express';
import { notificationsService } from './notifications.service';

export class NotificationsController {
  /**
   * GET /notifications
   * List notifications for the authenticated user
   */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const unreadOnly = req.query['unreadOnly'] === 'true';
      const result = await notificationsService.list(userId, unreadOnly);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /notifications/:id/read
   * Mark a single notification as read
   */
  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const id = req.params['id'] as string;
      const notification = await notificationsService.markRead(id, userId);
      res.json({ success: true, data: notification });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /notifications/read-all
   * Mark all notifications as read
   */
  async markAllRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await notificationsService.markAllRead(userId);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /notifications/:id
   * Delete a notification
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const id = req.params['id'] as string;
      const result = await notificationsService.delete(id, userId);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationsController = new NotificationsController();
