// apps/backend/src/modules/testimonials/testimonials.service.ts

import { prisma } from '../../config/database';
import { NotFoundException } from '../../utils/errors';

interface CreateTestimonialDTO {
  userId: string;
  content: string;
  rating: number;
}

interface UpdateTestimonialDTO {
  isApproved?: boolean;
  isFeatured?: boolean;
}

export class TestimonialsService {
  async findAll(filters: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, search, page = 1, limit = 10 } = filters;

    const where: any = {};

    if (status === 'pending') {
      where.isApproved = false;
    } else if (status === 'approved') {
      where.isApproved = true;
    }

    if (search) {
      where.OR = [
        { client: { fullName: { contains: search, mode: 'insensitive' } } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [testimonials, total] = await Promise.all([
      prisma.testimonial.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: [
          { isApproved: 'asc' }, // Pending first
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.testimonial.count({ where }),
    ]);

    return {
      data: testimonials,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findPublic(limit = 10) {
    const testimonials = await prisma.testimonial.findMany({
      where: {
        isApproved: true,
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    });

    return { data: testimonials };
  }

  async findFeatured(limit = 6) {
    const testimonials = await prisma.testimonial.findMany({
      where: {
        isApproved: true,
        isFeatured: true,
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { displayOrder: 'asc' },
      take: limit,
    });

    return { data: testimonials };
  }

  async create(data: CreateTestimonialDTO) {
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { fullName: true, avatarUrl: true },
    });

    const testimonial = await prisma.testimonial.create({
      data: {
        clientId: data.userId,
        clientName: user?.fullName || 'Anônimo',
        clientAvatarUrl: user?.avatarUrl,
        content: data.content,
        rating: data.rating,
        isApproved: false,
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    return { data: testimonial };
  }

  async update(id: string, data: UpdateTestimonialDTO) {
    const testimonial = await prisma.testimonial.findUnique({ where: { id } });

    if (!testimonial) {
      throw new NotFoundException('Depoimento não encontrado');
    }

    const updated = await prisma.testimonial.update({
      where: { id },
      data,
    });

    return { data: updated };
  }

  async delete(id: string) {
    const testimonial = await prisma.testimonial.findUnique({ where: { id } });

    if (!testimonial) {
      throw new NotFoundException('Depoimento não encontrado');
    }

    await prisma.testimonial.delete({ where: { id } });

    return { message: 'Depoimento excluído com sucesso' };
  }

  async getStats() {
    const [total, approved, pending, avgRating] = await Promise.all([
      prisma.testimonial.count(),
      prisma.testimonial.count({ where: { isApproved: true } }),
      prisma.testimonial.count({ where: { isApproved: false } }),
      prisma.testimonial.aggregate({
        where: { isApproved: true },
        _avg: { rating: true },
      }),
    ]);

    return {
      data: {
        total,
        approved,
        pending,
        averageRating: avgRating._avg.rating || 0,
      },
    };
  }
}

export const testimonialsService = new TestimonialsService();
