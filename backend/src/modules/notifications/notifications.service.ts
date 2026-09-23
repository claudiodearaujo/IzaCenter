// apps/backend/src/modules/notifications/notifications.service.ts

import { prisma } from '../../config/database';
import { Errors } from '../../middlewares/error.middleware';
import { DEFAULT_TENANT_ID } from '../tenant/tenant.constants';

export class NotificationsService {
  /**
   * List notifications for a user
   */
  async list(userId: string, unreadOnly: boolean = false, tenantId = DEFAULT_TENANT_ID) {
    const where: any = { userId, tenantId };
    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.notification.count({ where: { userId, tenantId, isRead: false } }),
    ]);

    return { notifications, unreadCount };
  }

  /**
   * Mark a single notification as read
   */
  async markRead(id: string, userId: string, tenantId = DEFAULT_TENANT_ID) {
    const notification = await prisma.notification.findFirst({ where: { id, userId, tenantId } });
    if (!notification) throw Errors.NotFound('Notificação');

    return prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllRead(userId: string, tenantId = DEFAULT_TENANT_ID) {
    const result = await prisma.notification.updateMany({
      where: { userId, tenantId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { updated: result.count };
  }

  /**
   * Delete a notification
   */
  async delete(id: string, userId: string, tenantId = DEFAULT_TENANT_ID) {
    const notification = await prisma.notification.findFirst({ where: { id, userId, tenantId } });
    if (!notification) throw Errors.NotFound('Notificação');

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
  }, tenantId = DEFAULT_TENANT_ID) {
    return prisma.notification.create({ data: { ...data, tenantId } });
  }
}

export const notificationsService = new NotificationsService();
