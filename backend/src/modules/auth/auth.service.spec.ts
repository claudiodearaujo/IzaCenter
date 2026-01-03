import { AuthService } from './auth.service';
import { prismaMock } from '../../test/mocks/prisma.mock';

// Mock utils
jest.mock('../../utils', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed_password'),
  comparePassword: jest.fn().mockResolvedValue(true),
  generateResetToken: jest.fn().mockReturnValue({
    token: 'reset_token_123',
    hashedToken: 'hashed_reset_token',
    expiry: new Date(Date.now() + 3600000),
  }),
  hashToken: jest.fn().mockReturnValue('hashed_token'),
  generateTokenPair: jest.fn().mockReturnValue({
    accessToken: 'access_token_123',
    refreshToken: 'refresh_token_123',
  }),
  verifyRefreshToken: jest.fn().mockReturnValue({ sub: 'user-123' }),
}));

jest.mock('../../utils/email.util', () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
  emailTemplates: {
    welcome: jest.fn().mockReturnValue({ subject: 'Welcome', html: '<p>Welcome</p>' }),
    passwordReset: jest.fn().mockReturnValue({ subject: 'Reset', html: '<p>Reset</p>' }),
  },
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  // =============================================
  // REGISTER
  // =============================================
  describe('register', () => {
    const registerData = {
      email: 'test@example.com',
      password: 'Password123!',
      fullName: 'Test User',
      phone: '11999999999',
    };

    it('should register a new user successfully', async () => {
      // Arrange
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: 'user-123',
        email: registerData.email,
        fullName: registerData.fullName,
        phone: registerData.phone,
        role: 'CLIENT',
        createdAt: new Date(),
      } as any);

      // Act
      const result = await authService.register(registerData);

      // Assert
      expect(result.user.email).toBe(registerData.email);
      expect(result.accessToken).toBe('access_token_123');
      expect(result.refreshToken).toBe('refresh_token_123');
    });

    it('should throw error if email already exists', async () => {
      // Arrange
      prismaMock.user.findUnique.mockResolvedValue({ id: 'existing' } as any);

      // Act & Assert
      await expect(authService.register(registerData)).rejects.toThrow(
        'Este email já está cadastrado'
      );
    });
  });

  // =============================================
  // LOGIN
  // =============================================
  describe('login', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should login user successfully', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        email: loginData.email,
        passwordHash: 'hashed_password',
        fullName: 'Test User',
        role: 'CLIENT',
      };
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      prismaMock.user.update.mockResolvedValue(mockUser as any);

      // Act
      const result = await authService.login(loginData);

      // Assert
      expect(result.user.email).toBe(loginData.email);
      expect(result.accessToken).toBeDefined();
    });

    it('should throw error if user not found', async () => {
      // Arrange
      prismaMock.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow(
        'Email ou senha incorretos'
      );
    });

    it('should throw error if password is wrong', async () => {
      // Arrange
      const { comparePassword } = require('../../utils');
      comparePassword.mockResolvedValueOnce(false);
      
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: loginData.email,
        passwordHash: 'wrong_hash',
      } as any);

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow(
        'Email ou senha incorretos'
      );
    });
  });

  // =============================================
  // FORGOT PASSWORD
  // =============================================
  describe('forgotPassword', () => {
    it('should return success message even if email not found', async () => {
      // Arrange
      prismaMock.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await authService.forgotPassword({ email: 'nonexistent@test.com' });

      // Assert
      expect(result.message).toContain('receberá um link');
    });

    it('should generate reset token and send email if user exists', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        email: 'test@test.com',
        fullName: 'Test User',
      };
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      prismaMock.user.update.mockResolvedValue(mockUser as any);

      // Act
      const result = await authService.forgotPassword({ email: 'test@test.com' });

      // Assert
      expect(result.message).toContain('receberá um link');
      expect(prismaMock.user.update).toHaveBeenCalled();
    });
  });

  // =============================================
  // RESET PASSWORD
  // =============================================
  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      // Arrange
      const mockUser = { id: 'user-123', email: 'test@test.com' };
      prismaMock.user.findFirst.mockResolvedValue(mockUser as any);
      prismaMock.user.update.mockResolvedValue(mockUser as any);

      // Act
      const result = await authService.resetPassword({
        token: 'reset_token_123',
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      });

      // Assert
      expect(result.message).toContain('Senha redefinida');
    });

    it('should throw error if token is invalid or expired', async () => {
      // Arrange
      prismaMock.user.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        authService.resetPassword({
          token: 'invalid_token',
          password: 'NewPassword123!',
          confirmPassword: 'NewPassword123!',
        })
      ).rejects.toThrow('Token inválido ou expirado');
    });
  });

  // =============================================
  // CHANGE PASSWORD
  // =============================================
  describe('changePassword', () => {
    it('should change password successfully', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        passwordHash: 'old_hash',
      };
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      prismaMock.user.update.mockResolvedValue(mockUser as any);

      // Act
      const result = await authService.changePassword('user-123', {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      });

      // Assert
      expect(result.message).toContain('Senha alterada');
    });

    it('should throw error if user not found', async () => {
      // Arrange
      prismaMock.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        authService.changePassword('nonexistent', {
          currentPassword: 'OldPassword123!',
          newPassword: 'NewPassword123!',
          confirmPassword: 'NewPassword123!',
        })
      ).rejects.toThrow();
    });

    it('should throw error if current password is wrong', async () => {
      // Arrange
      const { comparePassword } = require('../../utils');
      comparePassword.mockResolvedValueOnce(false);

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-123',
        passwordHash: 'hash',
      } as any);

      // Act & Assert
      await expect(
        authService.changePassword('user-123', {
          currentPassword: 'WrongPassword!',
          newPassword: 'NewPassword123!',
          confirmPassword: 'NewPassword123!',
        })
      ).rejects.toThrow('Senha atual incorreta');
    });
  });

  // =============================================
  // REFRESH TOKEN
  // =============================================
  describe('refreshToken', () => {
    it('should return new token pair', async () => {
      // Arrange
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@test.com',
        role: 'CLIENT',
      } as any);

      // Act
      const result = await authService.refreshToken('valid_refresh_token');

      // Assert
      expect(result.accessToken).toBe('access_token_123');
      expect(result.refreshToken).toBe('refresh_token_123');
    });

    it('should throw error if user not found', async () => {
      // Arrange
      prismaMock.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        authService.refreshToken('valid_refresh_token')
      ).rejects.toThrow('Refresh token inválido');
    });

    it('should throw error if refresh token is invalid', async () => {
      // Arrange
      const { verifyRefreshToken } = require('../../utils');
      verifyRefreshToken.mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(
        authService.refreshToken('invalid_refresh_token')
      ).rejects.toThrow('Refresh token inválido');
    });
  });

  // =============================================
  // GET PROFILE
  // =============================================
  describe('getProfile', () => {
    it('should return user profile', async () => {
      // Arrange
      const mockUser = {
        id: 'user-123',
        email: 'test@test.com',
        fullName: 'Test User',
        role: 'CLIENT',
      };
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);

      // Act
      const result = await authService.getProfile('user-123');

      // Assert
      expect(result.email).toBe('test@test.com');
      expect(result.fullName).toBe('Test User');
    });

    it('should throw error if user not found', async () => {
      // Arrange
      prismaMock.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.getProfile('nonexistent')).rejects.toThrow();
    });
  });
});
