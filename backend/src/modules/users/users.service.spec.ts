import { UsersService } from './users.service';
import { prismaMock } from '../../test/mocks/prisma.mock';
import { Prisma } from '@prisma/client';

// Mock supabase storage
jest.mock('../../config/supabase', () => ({
  storage: {
    upload: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
    getPublicUrl: jest.fn().mockReturnValue('https://storage.test/avatar.png'),
  },
}));

// Mock utils
jest.mock('../../utils', () => ({
  generateFileName: jest.fn().mockReturnValue('generated-file.png'),
  buildPaginationMeta: jest.fn().mockReturnValue({
    currentPage: 1,
    totalPages: 1,
    totalItems: 1,
    itemsPerPage: 10,
  }),
}));

describe('UsersService', () => {
  let usersService: UsersService;

  beforeEach(() => {
    usersService = new UsersService();
    jest.clearAllMocks();
  });

  // =============================================
  // GET BY ID
  // =============================================
  describe('getById', () => {
    const userId = 'user-123';
    const mockUser = {
      id: userId,
      email: 'user@test.com',
      fullName: 'User Teste',
      phone: '11999999999',
      birthDate: new Date('1990-01-01'),
      avatarUrl: null,
      role: 'CLIENT',
      preferredLanguage: 'pt',
      notificationEmail: true,
      notificationWhatsapp: false,
      notes: null,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      _count: { orders: 2, readings: 1, appointments: 0 },
    };

    it('should get user by id successfully', async () => {
      // Arrange
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);

      // Act
      const result = await usersService.getById(userId);

      // Assert
      expect(result.id).toBe(userId);
      expect(result.email).toBe('user@test.com');
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: expect.objectContaining({
          id: true,
          email: true,
          fullName: true,
          phone: true,
          birthDate: true,
          avatarUrl: true,
          role: true,
          preferredLanguage: true,
          notificationEmail: true,
          notificationWhatsapp: true,
          notes: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              orders: true,
              readings: true,
              appointments: true,
            },
          },
        }),
      });
    });

    it('should throw NotFound if user does not exist', async () => {
      // Arrange
      prismaMock.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(usersService.getById(userId)).rejects.toThrow('Usuário');
    });
  });

  // =============================================
  // UPDATE PROFILE
  // =============================================
  describe('updateProfile', () => {
    const userId = 'user-123';
    const updateData = {
      fullName: 'Updated Name',
      phone: '11888888888',
    };

    const mockUpdatedUser = {
      id: userId,
      email: 'user@test.com',
      fullName: 'Updated Name',
      phone: '11888888888',
      birthDate: null,
      avatarUrl: null,
      role: 'CLIENT',
      preferredLanguage: 'pt',
      notificationEmail: true,
      notificationWhatsapp: false,
      updatedAt: new Date(),
    };

    it('should update user profile successfully', async () => {
      // Arrange
      prismaMock.user.update.mockResolvedValue(mockUpdatedUser as any);

      // Act
      const result = await usersService.updateProfile(userId, updateData);

      // Assert
      expect(result.fullName).toBe('Updated Name');
      expect(result.phone).toBe('11888888888');
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData,
        select: expect.objectContaining({
          id: true,
          email: true,
          fullName: true,
          phone: true,
          birthDate: true,
          avatarUrl: true,
          role: true,
          preferredLanguage: true,
          notificationEmail: true,
          notificationWhatsapp: true,
          updatedAt: true,
        }),
      });
    });
  });

  // =============================================
  // LIST
  // =============================================
  describe('list', () => {
    const mockUsers = [
      {
        id: 'user-1',
        email: 'user1@test.com',
        fullName: 'User 1',
        phone: '11999999999',
        avatarUrl: null,
        role: 'CLIENT',
        createdAt: new Date(),
        lastLoginAt: null,
        _count: { orders: 1, readings: 0 },
      },
    ];

    it('should list users with pagination', async () => {
      // Arrange
      const query = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt' as const,
        sortOrder: 'desc' as const,
      };
      prismaMock.user.findMany.mockResolvedValue(mockUsers as any);
      prismaMock.user.count.mockResolvedValue(1);

      // Act
      const result = await usersService.list(query);

      // Assert
      expect(result.data).toEqual(mockUsers);
      expect(result.meta).toBeDefined();
      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: expect.objectContaining({
          id: true,
          email: true,
          fullName: true,
        }),
      });
    });

    it('should filter by role', async () => {
      // Arrange
      const query = {
        page: 1,
        limit: 10,
        role: 'ADMIN' as const,
        sortBy: 'createdAt' as const,
        sortOrder: 'desc' as const,
      };
      prismaMock.user.findMany.mockResolvedValue(mockUsers as any);
      prismaMock.user.count.mockResolvedValue(1);

      // Act
      await usersService.list(query);

      // Assert
      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        where: { role: 'ADMIN' },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: expect.any(Object),
      });
    });

    it('should search by name, email, or phone', async () => {
      // Arrange
      const query = {
        page: 1,
        limit: 10,
        search: 'User',
        sortBy: 'createdAt' as const,
        sortOrder: 'desc' as const,
      };
      prismaMock.user.findMany.mockResolvedValue(mockUsers as any);
      prismaMock.user.count.mockResolvedValue(1);

      // Act
      await usersService.list(query);

      // Assert
      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { fullName: { contains: 'User', mode: 'insensitive' } },
            { email: { contains: 'User', mode: 'insensitive' } },
            { phone: { contains: 'User' } },
          ],
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: expect.any(Object),
      });
    });

    it('should apply both role and search filters', async () => {
      // Arrange
      const query = {
        page: 1,
        limit: 10,
        search: 'User',
        role: 'CLIENT' as const,
        sortBy: 'createdAt' as const,
        sortOrder: 'desc' as const,
      };
      prismaMock.user.findMany.mockResolvedValue(mockUsers as any);
      prismaMock.user.count.mockResolvedValue(1);

      // Act
      await usersService.list(query);

      // Assert
      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        where: {
          role: 'CLIENT',
          OR: [
            { fullName: { contains: 'User', mode: 'insensitive' } },
            { email: { contains: 'User', mode: 'insensitive' } },
            { phone: { contains: 'User' } },
          ],
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: expect.any(Object),
      });
    });

    it('should handle pagination offset correctly', async () => {
      // Arrange
      const query = {
        page: 3,
        limit: 5,
        sortBy: 'createdAt' as const,
        sortOrder: 'asc' as const,
      };
      prismaMock.user.findMany.mockResolvedValue([] as any);
      prismaMock.user.count.mockResolvedValue(0);

      // Act
      await usersService.list(query);

      // Assert
      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 10,
        take: 5,
        orderBy: { createdAt: 'asc' },
        select: expect.any(Object),
      });
    });
  });

  // =============================================
  // ADMIN UPDATE
  // =============================================
  describe('adminUpdate', () => {
    const userId = 'user-123';
    const updateData = {
      role: 'ADMIN' as const,
      notes: 'Admin notes',
    };

    const mockUpdatedUser = {
      id: userId,
      email: 'user@test.com',
      fullName: 'User Teste',
      phone: null,
      birthDate: null,
      avatarUrl: null,
      role: 'ADMIN',
      notes: 'Admin notes',
      notificationEmail: true,
      notificationWhatsapp: false,
      updatedAt: new Date(),
    };

    it('should admin update user successfully', async () => {
      // Arrange
      prismaMock.user.update.mockResolvedValue(mockUpdatedUser as any);

      // Act
      const result = await usersService.adminUpdate(userId, updateData);

      // Assert
      expect(result.role).toBe('ADMIN');
      expect(result.notes).toBe('Admin notes');
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData,
        select: expect.objectContaining({
          id: true,
          email: true,
          fullName: true,
          role: true,
          notes: true,
          updatedAt: true,
        }),
      });
    });
  });

  // =============================================
  // DELETE
  // =============================================
  describe('delete', () => {
    const userId = 'user-123';

    it('should delete user successfully when no orders', async () => {
      // Arrange
      prismaMock.order.count.mockResolvedValue(0);
      prismaMock.user.delete.mockResolvedValue({} as any);

      // Act
      const result = await usersService.delete(userId);

      // Assert
      expect(result.message).toBe('Usuário excluído com sucesso');
      expect(prismaMock.order.count).toHaveBeenCalledWith({
        where: { clientId: userId },
      });
      expect(prismaMock.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw Conflict if user has orders', async () => {
      // Arrange
      prismaMock.order.count.mockResolvedValue(3);

      // Act & Assert
      await expect(usersService.delete(userId)).rejects.toThrow(
        'Usuário possui pedidos e não pode ser excluído'
      );
      expect(prismaMock.user.delete).not.toHaveBeenCalled();
    });
  });

  // =============================================
  // GET STATISTICS
  // =============================================
  describe('getStatistics', () => {
    const userId = 'user-123';

    it('should return user statistics', async () => {
      // Arrange
      prismaMock.order.aggregate.mockResolvedValue({
        _sum: { total: new Prisma.Decimal('500.00') },
        _count: 5,
      } as any);
      prismaMock.reading.count.mockResolvedValue(3);
      prismaMock.appointment.count.mockResolvedValue(2);

      // Act
      const result = await usersService.getStatistics(userId);

      // Assert
      expect(result.totalSpent).toEqual(new Prisma.Decimal('500.00'));
      expect(result.ordersCount).toBe(5);
      expect(result.readingsCount).toBe(3);
      expect(result.appointmentsCount).toBe(2);
      expect(prismaMock.order.aggregate).toHaveBeenCalledWith({
        where: { clientId: userId, status: 'COMPLETED' },
        _sum: { total: true },
        _count: true,
      });
      expect(prismaMock.reading.count).toHaveBeenCalledWith({
        where: { clientId: userId },
      });
      expect(prismaMock.appointment.count).toHaveBeenCalledWith({
        where: { clientId: userId },
      });
    });

    it('should return 0 totalSpent when no completed orders', async () => {
      // Arrange
      prismaMock.order.aggregate.mockResolvedValue({
        _sum: { total: null },
        _count: 0,
      } as any);
      prismaMock.reading.count.mockResolvedValue(0);
      prismaMock.appointment.count.mockResolvedValue(0);

      // Act
      const result = await usersService.getStatistics(userId);

      // Assert
      expect(result.totalSpent).toBe(0);
      expect(result.ordersCount).toBe(0);
      expect(result.readingsCount).toBe(0);
      expect(result.appointmentsCount).toBe(0);
    });
  });
});
