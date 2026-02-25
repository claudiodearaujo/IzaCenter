import { NotificationsService } from './notifications.service';
import { prismaMock } from '../../test/mocks/prisma.mock';
import { AppError } from '../../middlewares/error.middleware';

describe('NotificationsService', () => {
  let notificationsService: NotificationsService;

  beforeEach(() => {
    notificationsService = new NotificationsService();
    jest.clearAllMocks();
  });

  // =============================================
  // LIST
  // =============================================
  describe('list', () => {
    it('should return notifications and unread count for a user', async () => {
      const userId = 'user-1';
      const mockNotifications = [
        { id: 'n-1', userId, title: 'Leitura publicada', message: 'Sua leitura está pronta', isRead: false, createdAt: new Date() },
        { id: 'n-2', userId, title: 'Pedido confirmado', message: 'Pedido #001 confirmado', isRead: true, createdAt: new Date() },
      ];
      (prismaMock.notification.findMany as jest.Mock).mockResolvedValue(mockNotifications);
      (prismaMock.notification.count as jest.Mock).mockResolvedValue(1);

      const result = await notificationsService.list(userId);

      expect(result.notifications).toHaveLength(2);
      expect(result.unreadCount).toBe(1);
      expect(prismaMock.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId } })
      );
    });

    it('should filter only unread notifications when unreadOnly is true', async () => {
      const userId = 'user-1';
      (prismaMock.notification.findMany as jest.Mock).mockResolvedValue([]);
      (prismaMock.notification.count as jest.Mock).mockResolvedValue(0);

      await notificationsService.list(userId, true);

      expect(prismaMock.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId, isRead: false } })
      );
    });
  });

  // =============================================
  // MARK READ
  // =============================================
  describe('markRead', () => {
    it('should mark a notification as read', async () => {
      const userId = 'user-1';
      const notif = { id: 'n-1', userId, isRead: false } as any;
      (prismaMock.notification.findUnique as jest.Mock).mockResolvedValue(notif);
      (prismaMock.notification.update as jest.Mock).mockResolvedValue({ ...notif, isRead: true });

      const result = await notificationsService.markRead('n-1', userId);

      expect(prismaMock.notification.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'n-1' }, data: expect.objectContaining({ isRead: true }) })
      );
    });

    it('should throw NotFound when notification does not exist', async () => {
      (prismaMock.notification.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(notificationsService.markRead('non-existent', 'user-1')).rejects.toThrow(AppError);
    });

    it('should throw Forbidden when notification belongs to another user', async () => {
      (prismaMock.notification.findUnique as jest.Mock).mockResolvedValue({ id: 'n-1', userId: 'other-user' } as any);

      await expect(notificationsService.markRead('n-1', 'user-1')).rejects.toThrow(AppError);
    });
  });

  // =============================================
  // MARK ALL READ
  // =============================================
  describe('markAllRead', () => {
    it('should mark all notifications as read and return count', async () => {
      const userId = 'user-1';
      (prismaMock.notification.updateMany as jest.Mock).mockResolvedValue({ count: 3 });

      const result = await notificationsService.markAllRead(userId);

      expect(result.updated).toBe(3);
      expect(prismaMock.notification.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId, isRead: false } })
      );
    });
  });

  // =============================================
  // DELETE
  // =============================================
  describe('delete', () => {
    it('should delete a notification', async () => {
      const userId = 'user-1';
      const notif = { id: 'n-1', userId } as any;
      (prismaMock.notification.findUnique as jest.Mock).mockResolvedValue(notif);
      (prismaMock.notification.delete as jest.Mock).mockResolvedValue(notif);

      const result = await notificationsService.delete('n-1', userId);

      expect(prismaMock.notification.delete).toHaveBeenCalledWith({ where: { id: 'n-1' } });
      expect(result.message).toBeDefined();
    });

    it('should throw Forbidden when notification belongs to another user', async () => {
      (prismaMock.notification.findUnique as jest.Mock).mockResolvedValue({ id: 'n-1', userId: 'other-user' } as any);

      await expect(notificationsService.delete('n-1', 'user-1')).rejects.toThrow(AppError);
    });
  });

  // =============================================
  // CREATE
  // =============================================
  describe('create', () => {
    it('should create a notification', async () => {
      const data = { userId: 'user-1', title: 'Test', message: 'Test message' };
      const created = { id: 'n-new', ...data, isRead: false, createdAt: new Date() } as any;
      (prismaMock.notification.create as jest.Mock).mockResolvedValue(created);

      const result = await notificationsService.create(data);

      expect(prismaMock.notification.create).toHaveBeenCalledWith({ data });
      expect(result.id).toBe('n-new');
    });
  });
});
