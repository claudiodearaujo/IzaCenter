// apps/backend/src/modules/users/users.service.ts

import { prisma } from '../../config/database';
import { storage } from '../../config/supabase';
import { Errors } from '../../middlewares/error.middleware';
import { generateFileName, buildPaginationMeta } from '../../utils';
import { UpdateProfileDto, AdminUpdateUserDto, QueryUsersDto } from './users.schema';

export class UsersService {
  /**
   * Get user by ID
   */
  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
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
      },
    });

    if (!user) {
      throw Errors.NotFound('Usuário');
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: UpdateProfileDto) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
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
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Update user avatar
   */
  async updateAvatar(userId: string, file: Express.Multer.File) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true },
    });

    if (!user) {
      throw Errors.NotFound('Usuário');
    }

    // Delete old avatar if exists
    if (user.avatarUrl) {
      const oldPath = user.avatarUrl.split('/').pop();
      if (oldPath) {
        await storage.delete(`avatars/${oldPath}`).catch(console.error);
      }
    }

    // Upload new avatar
    const fileName = generateFileName(file.originalname);
    const filePath = `avatars/${userId}/${fileName}`;

    await storage.upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

    const avatarUrl = storage.getPublicUrl(filePath);

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: {
        id: true,
        avatarUrl: true,
      },
    });

    return updatedUser;
  }

  /**
   * Delete user avatar
   */
  async deleteAvatar(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true },
    });

    if (!user) {
      throw Errors.NotFound('Usuário');
    }

    if (user.avatarUrl) {
      const path = user.avatarUrl.split('/').slice(-2).join('/');
      await storage.delete(`avatars/${path}`).catch(console.error);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: null },
    });

    return { message: 'Avatar removido com sucesso' };
  }

  /**
   * List all users (admin)
   */
  async list(query: QueryUsersDto) {
    const { page, limit, search, role, sortBy, sortOrder } = query;

    const where: any = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          avatarUrl: true,
          role: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              orders: true,
              readings: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  /**
   * Admin update user
   */
  async adminUpdate(id: string, data: AdminUpdateUserDto) {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        birthDate: true,
        avatarUrl: true,
        role: true,
        notes: true,
        notificationEmail: true,
        notificationWhatsapp: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Delete user (soft delete or hard delete)
   */
  async delete(id: string) {
    // Check if user has orders
    const orderCount = await prisma.order.count({
      where: { clientId: id },
    });

    if (orderCount > 0) {
      throw Errors.Conflict('Usuário possui pedidos e não pode ser excluído');
    }

    await prisma.user.delete({
      where: { id },
    });

    return { message: 'Usuário excluído com sucesso' };
  }

  /**
   * Get user statistics
   */
  async getStatistics(userId: string) {
    const [ordersTotal, readingsCount, appointmentsCount] = await Promise.all([
      prisma.order.aggregate({
        where: { clientId: userId, status: 'COMPLETED' },
        _sum: { total: true },
        _count: true,
      }),
      prisma.reading.count({
        where: { clientId: userId },
      }),
      prisma.appointment.count({
        where: { clientId: userId },
      }),
    ]);

    return {
      totalSpent: ordersTotal._sum.total || 0,
      ordersCount: ordersTotal._count,
      readingsCount,
      appointmentsCount,
    };
  }
}

export const usersService = new UsersService();
