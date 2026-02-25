// apps/backend/src/modules/users/users.controller.spec.ts

import { Request, Response, NextFunction } from 'express';
import { UsersController } from './users.controller';
import { usersService } from './users.service';

// Mock the users service
jest.mock('./users.service', () => ({
  usersService: {
    getById: jest.fn(),
    updateProfile: jest.fn(),
    updateAvatar: jest.fn(),
    deleteAvatar: jest.fn(),
    getStatistics: jest.fn(),
    list: jest.fn(),
    adminUpdate: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockRequest = (overrides: Partial<Request> = {}): Partial<Request> => ({
  body: {},
  params: {},
  query: {},
  user: { id: 'user-1', email: 'user@test.com', role: 'CLIENT' } as any,
  file: undefined,
  ...overrides,
});

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext: NextFunction = jest.fn();

describe('UsersController', () => {
  let controller: UsersController;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    controller = new UsersController();
    req = mockRequest();
    res = mockResponse();
    jest.clearAllMocks();
  });

  // =============================================
  // CLIENT ROUTES
  // =============================================
  describe('getProfile', () => {
    it('should return current user profile', async () => {
      const mockUser = { id: 'user-1', email: 'user@test.com', fullName: 'Test User' };
      (usersService.getById as jest.Mock).mockResolvedValue(mockUser);

      await controller.getProfile(req as Request, res as Response, mockNext);

      expect(usersService.getById).toHaveBeenCalledWith('user-1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
      });
    });

    it('should call next with error if user not found', async () => {
      const error = new Error('Usuário não encontrado');
      (usersService.getById as jest.Mock).mockRejectedValue(error);

      await controller.getProfile(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile and return success', async () => {
      const updateData = { fullName: 'Updated Name', phone: '11999999999' };
      const mockUser = { id: 'user-1', ...updateData };
      req.body = updateData;
      (usersService.updateProfile as jest.Mock).mockResolvedValue(mockUser);

      await controller.updateProfile(req as Request, res as Response, mockNext);

      expect(usersService.updateProfile).toHaveBeenCalledWith('user-1', updateData);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: mockUser,
      });
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Update failed');
      req.body = {};
      (usersService.updateProfile as jest.Mock).mockRejectedValue(error);

      await controller.updateProfile(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('uploadAvatar', () => {
    it('should upload avatar when file is provided', async () => {
      const mockFile = { originalname: 'avatar.jpg', buffer: Buffer.from('') } as Express.Multer.File;
      const mockUser = { id: 'user-1', avatarUrl: 'https://example.com/avatar.jpg' };
      (req as any).file = mockFile;
      (usersService.updateAvatar as jest.Mock).mockResolvedValue(mockUser);

      await controller.uploadAvatar(req as Request, res as Response, mockNext);

      expect(usersService.updateAvatar).toHaveBeenCalledWith('user-1', mockFile);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Avatar atualizado com sucesso',
        data: mockUser,
      });
    });

    it('should return 400 if no file provided', async () => {
      (req as any).file = undefined;

      await controller.uploadAvatar(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Nenhum arquivo enviado',
      });
    });

    it('should call next with error on upload failure', async () => {
      const error = new Error('Upload failed');
      const mockFile = { originalname: 'avatar.jpg' } as Express.Multer.File;
      (req as any).file = mockFile;
      (usersService.updateAvatar as jest.Mock).mockRejectedValue(error);

      await controller.uploadAvatar(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteAvatar', () => {
    it('should delete avatar and return success', async () => {
      (usersService.deleteAvatar as jest.Mock).mockResolvedValue({
        message: 'Avatar removido com sucesso',
      });

      await controller.deleteAvatar(req as Request, res as Response, mockNext);

      expect(usersService.deleteAvatar).toHaveBeenCalledWith('user-1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Avatar removido com sucesso',
      });
    });
  });

  describe('getStatistics', () => {
    it('should return current user statistics', async () => {
      const mockStats = {
        totalOrders: 5,
        totalReadings: 3,
        totalAppointments: 2,
      };
      (usersService.getStatistics as jest.Mock).mockResolvedValue(mockStats);

      await controller.getStatistics(req as Request, res as Response, mockNext);

      expect(usersService.getStatistics).toHaveBeenCalledWith('user-1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockStats,
      });
    });
  });

  // =============================================
  // ADMIN ROUTES
  // =============================================
  describe('list', () => {
    it('should return all users for admin', async () => {
      const mockResult = {
        data: [{ id: 'user-1' }, { id: 'user-2' }],
        meta: { total: 2, page: 1, limit: 10 },
      };
      req.query = {};
      (usersService.list as jest.Mock).mockResolvedValue(mockResult);

      await controller.list(req as Request, res as Response, mockNext);

      expect(usersService.list).toHaveBeenCalledWith({});
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult.data,
        meta: mockResult.meta,
      });
    });
  });

  describe('getById', () => {
    it('should return user by ID (admin)', async () => {
      const mockUser = { id: 'user-2', email: 'user2@test.com', role: 'CLIENT' };
      req.params = { id: 'user-2' };
      (usersService.getById as jest.Mock).mockResolvedValue(mockUser);

      await controller.getById(req as Request, res as Response, mockNext);

      expect(usersService.getById).toHaveBeenCalledWith('user-2');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
      });
    });
  });

  describe('update', () => {
    it('should update user (admin) and return success', async () => {
      const updateData = { role: 'ADMIN', isActive: true };
      const mockUser = { id: 'user-2', ...updateData };
      req.params = { id: 'user-2' };
      req.body = updateData;
      (usersService.adminUpdate as jest.Mock).mockResolvedValue(mockUser);

      await controller.update(req as Request, res as Response, mockNext);

      expect(usersService.adminUpdate).toHaveBeenCalledWith('user-2', updateData);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Usuário atualizado com sucesso',
        data: mockUser,
      });
    });
  });

  describe('delete', () => {
    it('should delete user and return success message', async () => {
      req.params = { id: 'user-2' };
      (usersService.delete as jest.Mock).mockResolvedValue({
        message: 'Usuário excluído com sucesso',
      });

      await controller.delete(req as Request, res as Response, mockNext);

      expect(usersService.delete).toHaveBeenCalledWith('user-2');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Usuário excluído com sucesso',
      });
    });

    it('should call next with error if user not found', async () => {
      const error = new Error('Usuário não encontrado');
      req.params = { id: 'nonexistent' };
      (usersService.delete as jest.Mock).mockRejectedValue(error);

      await controller.delete(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getUserStatistics', () => {
    it('should return user statistics (admin)', async () => {
      const mockStats = { totalOrders: 3, totalReadings: 1 };
      req.params = { id: 'user-2' };
      (usersService.getStatistics as jest.Mock).mockResolvedValue(mockStats);

      await controller.getUserStatistics(req as Request, res as Response, mockNext);

      expect(usersService.getStatistics).toHaveBeenCalledWith('user-2');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockStats,
      });
    });
  });
});
