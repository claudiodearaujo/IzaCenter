// apps/backend/src/modules/auth/auth.service.ts

import { prisma } from '../../config/database';
import { DEFAULT_TENANT_ID } from '../tenant/tenant.constants';
import { env } from '../../config/env';
import { AppError, Errors } from '../../middlewares/error.middleware';
import {
  hashPassword,
  comparePassword,
  generateResetToken,
  hashToken,
  generateTokenPair,
  rotateRefreshToken,
  revokeAccessSession,
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
  async register(data: RegisterDto, tenantId = DEFAULT_TENANT_ID) {
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
        tenantMemberships: {
          create: {
            tenantId,
            role: 'CLIENT',
          },
        },
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
    const tokens = await generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Send welcome email (non-blocking)
    this.sendWelcomeEmail(user.fullName, user.email).catch(() => console.error('BACKGROUND_OPERATION_FAILED'));

    return {
      user,
      membership: {
        role: 'CLIENT' as const,
        isActive: true,
      },
      ...tokens,
    };
  }

  /**
   * Login user
   */
  async login(data: LoginDto, tenantId = DEFAULT_TENANT_ID) {
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

    const membership = await prisma.tenantMembership.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId: user.id,
        },
      },
      select: { id: true, role: true, isActive: true },
    });

    if (!membership?.isActive) {
      throw Errors.Unauthorized('Email ou senha incorretos');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const tokens = await generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
      authVersion: user.authVersion,
    });

    // Return user without password
    const { passwordHash, resetToken, resetTokenExpiry, authVersion, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      membership: {
        id: membership.id,
        role: membership.role,
        isActive: membership.isActive,
      },
      ...tokens,
    };
  }

  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordDto, tenantId = DEFAULT_TENANT_ID) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    // Always return success for security (don't reveal if email exists)
    if (!user) {
      return { message: 'Se o email existir, você receberá um link de redefinição' };
    }

    const membership = await prisma.tenantMembership.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId: user.id,
        },
      },
      select: { isActive: true },
    });

    if (!membership?.isActive) {
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
    }).catch(() => console.error('BACKGROUND_OPERATION_FAILED'));

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

    const changed = await prisma.user.updateMany({
      where: { id: user.id, resetToken: hashedToken, resetTokenExpiry: { gt: new Date() } },
      data: { passwordHash, resetToken: null, resetTokenExpiry: null, authVersion: { increment: 1 } },
    });
    if (changed.count !== 1) throw Errors.BadRequest('Token inválido ou expirado');

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
      data: { passwordHash, authVersion: { increment: 1 }, resetToken: null, resetTokenExpiry: null },
    });

    return { message: 'Senha alterada com sucesso' };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string, tenantId = DEFAULT_TENANT_ID) {
    try {
      const tokens = await rotateRefreshToken(refreshToken, tenantId);
      const { sub } = (await import('../../utils/jwt.util')).verifyAccessToken(tokens.accessToken);
      const user = await this.getProfile(sub);
      const membership = await prisma.tenantMembership.findUnique({
        where: { tenantId_userId: { tenantId, userId: sub } },
        select: { id: true, role: true, isActive: true },
      });
      return { ...tokens, user, membership };
    } catch {
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
   * Logout user (client should discard the token)
   */
  async logout(token: string) {
    await revokeAccessSession(token);
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
