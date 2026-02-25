// apps/backend/src/modules/auth/auth.controller.spec.ts

import { Request, Response, NextFunction } from 'express';
import { AuthController } from './auth.controller';
import { authService } from './auth.service';

// Mock the auth service
jest.mock('./auth.service', () => ({
  authService: {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    changePassword: jest.fn(),
    refreshToken: jest.fn(),
    getProfile: jest.fn(),
  },
}));

const mockRequest = (overrides: Partial<Request> = {}): Partial<Request> => ({
  body: {},
  params: {},
  headers: {},
  user: undefined,
  ...overrides,
});

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext: NextFunction = jest.fn();

describe('AuthController', () => {
  let controller: AuthController;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    controller = new AuthController();
    req = mockRequest();
    res = mockResponse();
    jest.clearAllMocks();
  });

  // =============================================
  // REGISTER
  // =============================================
  describe('register', () => {
    it('should register user and return 201', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'Password123!',
        fullName: 'Test User',
      };
      const serviceResult = {
        user: { id: 'user-1', email: registerData.email },
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      };

      req.body = registerData;
      (authService.register as jest.Mock).mockResolvedValue(serviceResult);

      await controller.register(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Cadastro realizado com sucesso',
        data: serviceResult,
      });
    });

    it('should call next with error if registration fails', async () => {
      const error = new Error('Email já cadastrado');
      req.body = { email: 'test@example.com', password: 'pass' };
      (authService.register as jest.Mock).mockRejectedValue(error);

      await controller.register(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // =============================================
  // LOGIN
  // =============================================
  describe('login', () => {
    it('should login user and return 200', async () => {
      const loginData = { email: 'test@example.com', password: 'Password123!' };
      const serviceResult = {
        user: { id: 'user-1', email: loginData.email },
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      };

      req.body = loginData;
      (authService.login as jest.Mock).mockResolvedValue(serviceResult);

      await controller.login(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login realizado com sucesso',
        data: serviceResult,
      });
    });

    it('should call next with error if login fails', async () => {
      const error = new Error('Email ou senha incorretos');
      req.body = { email: 'test@example.com', password: 'wrong' };
      (authService.login as jest.Mock).mockRejectedValue(error);

      await controller.login(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // =============================================
  // FORGOT PASSWORD
  // =============================================
  describe('forgotPassword', () => {
    it('should return success message', async () => {
      req.body = { email: 'test@example.com' };
      (authService.forgotPassword as jest.Mock).mockResolvedValue({
        message: 'Se o email existir, você receberá um link',
      });

      await controller.forgotPassword(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Se o email existir, você receberá um link',
      });
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Unexpected error');
      req.body = { email: 'test@example.com' };
      (authService.forgotPassword as jest.Mock).mockRejectedValue(error);

      await controller.forgotPassword(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // =============================================
  // RESET PASSWORD
  // =============================================
  describe('resetPassword', () => {
    it('should reset password and return success', async () => {
      req.body = {
        token: 'valid_token',
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      };
      (authService.resetPassword as jest.Mock).mockResolvedValue({
        message: 'Senha redefinida com sucesso',
      });

      await controller.resetPassword(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Senha redefinida com sucesso',
      });
    });

    it('should call next with error if token is invalid', async () => {
      const error = new Error('Token inválido ou expirado');
      req.body = { token: 'invalid_token', password: 'pass', confirmPassword: 'pass' };
      (authService.resetPassword as jest.Mock).mockRejectedValue(error);

      await controller.resetPassword(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // =============================================
  // CHANGE PASSWORD
  // =============================================
  describe('changePassword', () => {
    it('should change password and return success', async () => {
      req.body = {
        currentPassword: 'Old123!',
        newPassword: 'New123!',
        confirmPassword: 'New123!',
      };
      (req as any).user = { id: 'user-1' };
      (authService.changePassword as jest.Mock).mockResolvedValue({
        message: 'Senha alterada com sucesso',
      });

      await controller.changePassword(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Senha alterada com sucesso',
      });
    });

    it('should call next with error if current password is wrong', async () => {
      const error = new Error('Senha atual incorreta');
      (req as any).user = { id: 'user-1' };
      req.body = { currentPassword: 'wrong', newPassword: 'New123!', confirmPassword: 'New123!' };
      (authService.changePassword as jest.Mock).mockRejectedValue(error);

      await controller.changePassword(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // =============================================
  // REFRESH TOKEN
  // =============================================
  describe('refreshToken', () => {
    it('should return new token pair', async () => {
      req.body = { refreshToken: 'valid_refresh_token' };
      (authService.refreshToken as jest.Mock).mockResolvedValue({
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
      });

      await controller.refreshToken(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Token atualizado com sucesso',
        data: {
          accessToken: 'new_access_token',
          refreshToken: 'new_refresh_token',
        },
      });
    });

    it('should call next with error if refresh token is invalid', async () => {
      const error = new Error('Refresh token inválido');
      req.body = { refreshToken: 'invalid' };
      (authService.refreshToken as jest.Mock).mockRejectedValue(error);

      await controller.refreshToken(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // =============================================
  // GET PROFILE
  // =============================================
  describe('getProfile', () => {
    it('should return user profile', async () => {
      (req as any).user = { id: 'user-1' };
      const mockUser = { id: 'user-1', email: 'test@example.com', fullName: 'Test User' };
      (authService.getProfile as jest.Mock).mockResolvedValue(mockUser);

      await controller.getProfile(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
      });
    });

    it('should call next with error if user not found', async () => {
      const error = new Error('Usuário não encontrado');
      (req as any).user = { id: 'nonexistent' };
      (authService.getProfile as jest.Mock).mockRejectedValue(error);

      await controller.getProfile(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // =============================================
  // LOGOUT
  // =============================================
  describe('logout', () => {
    it('should logout user and blacklist token', async () => {
      req.headers = { authorization: 'Bearer valid_token' };
      (authService.logout as jest.Mock).mockResolvedValue({
        message: 'Logout realizado com sucesso',
      });

      await controller.logout(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logout realizado com sucesso',
      });
    });

    it('should return 401 if no authorization header', async () => {
      req.headers = {};

      await controller.logout(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token de autenticação não fornecido',
      });
    });

    it('should return 401 if authorization header is not Bearer', async () => {
      req.headers = { authorization: 'Basic some_token' };

      await controller.logout(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should call next with error if logout service fails', async () => {
      const error = new Error('Service error');
      req.headers = { authorization: 'Bearer some_token' };
      (authService.logout as jest.Mock).mockRejectedValue(error);

      await controller.logout(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
