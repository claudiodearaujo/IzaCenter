// apps/backend/src/modules/readings/readings.service.ts

import { prisma } from '../../config/database';
import { NotFoundException, BadRequestException } from '../../utils/errors';
import { sendEmail } from '../../utils/email';

interface UpdateReadingDTO {
  title?: string;
  introduction?: string;
  generalGuidance?: string;
  recommendations?: string;
  goals?: string;
  closingMessage?: string;
  cards?: {
    cardId: string;
    position: number;
    positionName: string;
    interpretation: string;
    isReversed?: boolean;
  }[];
}

export class ReadingsService {
  async findAll(filters: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, search, page = 1, limit = 10 } = filters;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { client: { fullName: { contains: search, mode: 'insensitive' } } },
        { client: { email: { contains: search, mode: 'insensitive' } } },
        { title: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [readings, total] = await Promise.all([
      prisma.reading.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          orderItem: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: [
          { status: 'asc' }, // PENDING first
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.reading.count({ where }),
    ]);

    return {
      data: readings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByUser(userId: string) {
    const readings = await prisma.reading.findMany({
      where: { clientId: userId },
      include: {
        orderItem: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                coverImageUrl: true,
              },
            },
          },
        },
        cards: {
          include: {
            card: true,
          },
          orderBy: { position: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { data: readings };
  }

  async findById(id: string, userId?: string) {
    const reading = await prisma.reading.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        orderItem: {
          include: {
            product: true,
          },
        },
        cards: {
          include: {
            card: true,
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!reading) {
      throw new NotFoundException('Leitura não encontrada');
    }

    // If userId is provided, check ownership
    if (userId && reading.clientId !== userId) {
      throw new NotFoundException('Leitura não encontrada');
    }

    return { data: reading };
  }

  async update(id: string, data: UpdateReadingDTO) {
    const reading = await prisma.reading.findUnique({ where: { id } });

    if (!reading) {
      throw new NotFoundException('Leitura não encontrada');
    }

    if (reading.status === 'PUBLISHED') {
      throw new BadRequestException('Leituras publicadas não podem ser editadas');
    }

    // Update reading
    const updated = await prisma.$transaction(async (tx) => {
      // Update main reading data
      const updatedReading = await tx.reading.update({
        where: { id },
        data: {
          title: data.title,
          introduction: data.introduction,
          generalGuidance: data.generalGuidance,
          recommendations: data.recommendations,
          goals: data.goals,
          closingMessage: data.closingMessage,
          status: 'IN_PROGRESS',
        },
      });

      // Update cards if provided
      if (data.cards && data.cards.length > 0) {
        // Remove existing cards
        await tx.readingCard.deleteMany({ where: { readingId: id } });

        // Add new cards
        await tx.readingCard.createMany({
          data: data.cards.map((card) => ({
            readingId: id,
            cardId: card.cardId,
            position: card.position,
            positionName: card.positionName,
            interpretation: card.interpretation,
            isReversed: card.isReversed || false,
          })),
        });
      }

      return updatedReading;
    });

    return { data: updated };
  }

  async updateStatus(id: string, status: string) {
    const reading = await prisma.reading.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!reading) {
      throw new NotFoundException('Leitura não encontrada');
    }

    const updateData: any = { status };

    if (status === 'PUBLISHED') {
      updateData.publishedAt = new Date();
      updateData.readingDate = new Date();

      // Send notification email
      if (reading.client.email) {
        await sendEmail({
          to: reading.client.email,
          subject: 'Sua Leitura está Pronta! - Izabela Tarot',
          template: 'reading-published',
          data: {
            clientName: reading.client.fullName,
            readingTitle: reading.title,
          },
        });
      }
    }

    const updated = await prisma.reading.update({
      where: { id },
      data: updateData,
    });

    return { data: updated };
  }

  async updateAudio(id: string, audioUrl: string) {
    const reading = await prisma.reading.findUnique({ where: { id } });

    if (!reading) {
      throw new NotFoundException('Leitura não encontrada');
    }

    const updated = await prisma.reading.update({
      where: { id },
      data: { audioUrl },
    });

    return { data: updated };
  }

  async delete(id: string) {
    const reading = await prisma.reading.findUnique({ where: { id } });

    if (!reading) {
      throw new NotFoundException('Leitura não encontrada');
    }

    if (reading.status === 'PUBLISHED') {
      throw new BadRequestException('Leituras publicadas não podem ser excluídas');
    }

    await prisma.reading.delete({ where: { id } });

    return { message: 'Leitura excluída com sucesso' };
  }

  async getStats() {
    const [total, pending, inProgress, published] = await Promise.all([
      prisma.reading.count(),
      prisma.reading.count({ where: { status: 'PENDING' } }),
      prisma.reading.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.reading.count({ where: { status: 'PUBLISHED' } }),
    ]);

    return {
      data: {
        total,
        pending,
        inProgress,
        published,
      },
    };
  }
}

export const readingsService = new ReadingsService();
