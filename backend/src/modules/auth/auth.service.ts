// apps/backend/src/modules/auth/auth.service.ts

import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { tokenBlacklist } from '../../config/redis';
import { AppError, Errors } from '../../middlewares/error.middleware';
import {
  hashPassword,
  comparePassword,
  generateResetToken,
  hashToken,
  generateTokenPair,
  verifyRefreshToken,
} from '../../utils';
import { sendEmail, emailTemplates } from '../../utils/email.util';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './auth.schema';

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterDto) {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw Errors.Conflict('Este email já está cadastrado');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        phone: data.phone,
        birthDate: data.birthDate,
        role: 'CLIENT',
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        birthDate: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Send welcome email (non-blocking)
    this.sendWelcomeEmail(user.fullName, user.email).catch(console.error);

    return {
      user,
      ...tokens,
    };
  }

  /**
   * Login user
   */
  async login(data: LoginDto) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw Errors.Unauthorized('Email ou senha incorretos');
    }

    // Verify password
    const isValidPassword = await comparePassword(data.password, user.passwordHash);

    if (!isValidPassword) {
      throw Errors.Unauthorized('Email ou senha incorretos');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const tokens = generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user without password
    const { passwordHash, resetToken, resetTokenExpiry, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordDto) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    // Always return success for security (don't reveal if email exists)
    if (!user) {
      return { message: 'Se o email existir, você receberá um link de redefinição' };
    }

    // Generate reset token
    const { token, hashedToken, expiry } = generateResetToken();

    // Save hashed token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry: expiry,
      },
    });

    // Build reset URL
    const resetUrl = `${env.FRONTEND_URL}/auth/reset-password?token=${token}`;

    // Send email (non-blocking)
    const emailContent = emailTemplates.passwordReset(user.fullName, resetUrl);
    sendEmail({
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
    }).catch(console.error);

    return { message: 'Se o email existir, você receberá um link de redefinição' };
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordDto) {
    // Hash the token from URL
    const hashedToken = hashToken(data.token);

    // Find user with valid token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw Errors.BadRequest('Token inválido ou expirado');
    }

    // Hash new password
    const passwordHash = await hashPassword(data.password);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return { message: 'Senha redefinida com sucesso' };
  }

  /**
   * Change password (authenticated)
   */
  async changePassword(userId: string, data: ChangePasswordDto) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw Errors.NotFound('Usuário');
    }

    // Verify current password
    const isValidPassword = await comparePassword(data.currentPassword, user.passwordHash);

    if (!isValidPassword) {
      throw Errors.Unauthorized('Senha atual incorreta');
    }

    // Hash new password
    const passwordHash = await hashPassword(data.newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: 'Senha alterada com sucesso' };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    try {
      const decoded = verifyRefreshToken(refreshToken);

      const user = await prisma.user.findUnique({
        where: { id: decoded.sub },
        select: { id: true, email: true, role: true },
      });

      if (!user) {
        throw Errors.Unauthorized('Usuário não encontrado');
      }

      // Generate new tokens
      const tokens = generateTokenPair({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return tokens;
    } catch (error) {
      throw Errors.Unauthorized('Refresh token inválido');
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
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
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw Errors.NotFound('Usuário');
    }

    return user;
  }

  /**
   * Logout user by blacklisting the token
   */
  async logout(token: string) {
    // Extract token expiration time
    const expiresIn = env.JWT_EXPIRES_IN;

    // Convert expiration string to seconds
    let expiresInSeconds = 900; // Default 15 minutes

    if (expiresIn.endsWith('m')) {
      expiresInSeconds = parseInt(expiresIn) * 60;
    } else if (expiresIn.endsWith('h')) {
      expiresInSeconds = parseInt(expiresIn) * 3600;
    } else if (expiresIn.endsWith('d')) {
      expiresInSeconds = parseInt(expiresIn) * 86400;
    }

    // Add token to blacklist with its remaining TTL
    await tokenBlacklist.add(token, expiresInSeconds);

    return { message: 'Logout realizado com sucesso' };
  }

  /**
   * Send welcome email
   */
  private async sendWelcomeEmail(name: string, email: string) {
    const emailContent = emailTemplates.welcome(name);
    await sendEmail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
    });
  }
}

export const authService = new AuthService();
