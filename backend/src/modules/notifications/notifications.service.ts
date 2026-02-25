// apps/backend/src/modules/notifications/notifications.service.ts

import { prisma } from '../../config/database';
import { Errors } from '../../middlewares/error.middleware';

export class NotificationsService {
  /**
   * List notifications for a user
   */
  async list(userId: string, unreadOnly: boolean = false) {
    const where: any = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return { notifications, unreadCount };
  }

  /**
   * Mark a single notification as read
   */
  async markRead(id: string, userId: string) {
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) throw Errors.NotFound('Notificação');
    if (notification.userId !== userId) throw Errors.Forbidden();

    return prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { updated: result.count };
  }

  /**
   * Delete a notification
   */
  async delete(id: string, userId: string) {
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) throw Errors.NotFound('Notificação');
    if (notification.userId !== userId) throw Errors.Forbidden();

    await prisma.notification.delete({ where: { id } });
    return { message: 'Notificação excluída' };
  }

  /**
   * Create a notification (internal helper used by other services)
   */
  async create(data: {
    userId: string;
    title: string;
    message: string;
    type?: string;
    referenceId?: string;
  }) {
    return prisma.notification.create({ data });
  }
}

export const notificationsService = new NotificationsService();
