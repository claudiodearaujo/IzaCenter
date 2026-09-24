// apps/backend/src/modules/readings/readings.service.ts

import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { privateMedia } from '../../config/supabase';
import { NotFoundException, BadRequestException } from '../../utils/errors';
import { generateFileName } from '../../utils';
import { sendEmail } from '../../utils/email.util';
import { DEFAULT_TENANT_ID } from '../tenant/tenant.constants';

interface DeliveryContent {
  introduction?: string;
  body?: string;
  recommendations?: string;
  goals?: string;
  closing?: string;
  [key: string]: unknown;
}

interface DeliverySpecialtyModule {
  key: string;
  version?: number;
  config?: Record<string, unknown>;
}

interface UpdateReadingDTO {
  title?: string;
  deliveryType?: string;
  content?: DeliveryContent;
  specialtyModule?: DeliverySpecialtyModule | null;
  metadata?: Record<string, unknown>;
  // Legacy aliases kept during the migration window.
  introduction?: string;
  generalGuidance?: string;
  recommendations?: string;
  goals?: string;
  closingMessage?: string;
  interpretation?: string;
  advice?: string;
  conclusion?: string;
  cards?: {
    cardId: string;
    position: number;
    positionName?: string;
    interpretation?: string;
    isReversed?: boolean;
  }[];
}

export class ReadingsService {
  private async assertCardsInTenant(cards: UpdateReadingDTO['cards'], tenantId: string) {
    if (!cards?.length) return;
    const cardIds = [...new Set(cards.map((card) => card.cardId))];
    const count = await prisma.ciganoCard.count({
      where: { tenantId, id: { in: cardIds } },
    });
    if (count != cardIds.length) {
      throw new BadRequestException('Uma ou mais cartas não pertencem ao tenant atual');
    }
  }

  private normalizeContent(reading: any): DeliveryContent {
    const stored = (reading.content || {}) as DeliveryContent;

    return {
      ...stored,
      ...(reading.introduction != null ? { introduction: reading.introduction } : {}),
      ...(reading.generalGuidance != null ? { body: reading.generalGuidance } : {}),
      ...(reading.recommendations != null ? { recommendations: reading.recommendations } : {}),
      ...(reading.goals != null ? { goals: reading.goals } : {}),
      ...(reading.closingMessage != null ? { closing: reading.closingMessage } : {}),
    };
  }

  private inferDeliveryType(reading: any): string {
    if (reading.deliveryType) return reading.deliveryType;
    if (reading.videoUrl) return 'VIDEO';
    if (reading.audioUrl) return 'AUDIO';
    if (reading.pdfUrl) return 'DOCUMENT';
    return 'CONTENT';
  }

  private async toDelivery(reading: any) {
    const content = this.normalizeContent(reading);
    const orderItem = reading.orderItem
      ? {
          ...reading.orderItem,
          questions: reading.orderItem.questions ?? reading.orderItem.clientQuestions ?? [],
        }
      : reading.orderItem;

    return {
      ...reading,
      audioUrl: await privateMedia.resolve(reading.audioUrl, reading.tenantId, reading.id),
      deliveryType: this.inferDeliveryType(reading),
      content,
      specialtyModule: reading.specialtyModule || null,
      metadata: reading.metadata || {},
      introduction: content.introduction,
      generalGuidance: content.body,
      recommendations: content.recommendations,
      goals: content.goals,
      closingMessage: content.closing,
      // Legacy frontend aliases.
      interpretation: content.body,
      advice: content.recommendations,
      conclusion: content.closing,
      product: orderItem?.product,
      orderItem,
    };
  }

  private buildDeliveryUpdate(reading: any, data: UpdateReadingDTO) {
    const current = this.normalizeContent(reading);
    const incoming = data.content || {};

    const content: DeliveryContent = {
      ...current,
      ...incoming,
      introduction:
        incoming.introduction ??
        data.introduction ??
        current.introduction,
      body:
        incoming.body ??
        data.generalGuidance ??
        data.interpretation ??
        current.body,
      recommendations:
        incoming.recommendations ??
        data.recommendations ??
        data.advice ??
        current.recommendations,
      goals:
        incoming.goals ??
        data.goals ??
        current.goals,
      closing:
        incoming.closing ??
        data.closingMessage ??
        data.conclusion ??
        current.closing,
    };

    return {
      title: data.title,
      deliveryType: data.deliveryType ?? reading.deliveryType ?? this.inferDeliveryType(reading),
      content: content as Prisma.InputJsonValue,
      specialtyModule:
        data.specialtyModule === null
          ? Prisma.JsonNull
          : ((data.specialtyModule ?? reading.specialtyModule ?? Prisma.JsonNull) as Prisma.InputJsonValue | typeof Prisma.JsonNull),
      metadata: (data.metadata ?? reading.metadata ?? {}) as Prisma.InputJsonValue,
      introduction: content.introduction,
      generalGuidance: content.body,
      recommendations: content.recommendations,
      goals: content.goals,
      closingMessage: content.closing,
      status: 'IN_PROGRESS' as const,
    };
  }

  async findAll(filters: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }, tenantId = DEFAULT_TENANT_ID) {
    const { status, search, page = 1, limit = 10 } = filters;

    const where: any = { tenantId };

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
      data: await Promise.all(readings.map((reading) => this.toDelivery(reading))),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByUser(userId: string, tenantId = DEFAULT_TENANT_ID) {
    const readings = await prisma.reading.findMany({
      where: { clientId: userId, tenantId },
      include: {
        orderItem: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                coverImageUrl: true,
                productType: true,
                serviceKind: true,
                capabilities: true,
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

    return { data: await Promise.all(readings.map((reading) => this.toDelivery(reading))) };
  }

  async findById(id: string, userId?: string, tenantId = DEFAULT_TENANT_ID) {
    const reading = await prisma.reading.findFirst({
      where: { id, tenantId },
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
      throw new NotFoundException('Entrega não encontrada');
    }

    // If userId is provided, check ownership
    if (userId && reading.clientId !== userId) {
      throw new NotFoundException('Entrega não encontrada');
    }

    return { data: await this.toDelivery(reading) };
  }

  async update(id: string, data: UpdateReadingDTO, tenantId = DEFAULT_TENANT_ID) {
    const reading = await prisma.reading.findFirst({ where: { id, tenantId } });

    if (!reading) {
      throw new NotFoundException('Entrega não encontrada');
    }

    if (reading.status === 'PUBLISHED') {
      throw new BadRequestException('Entregas publicadas não podem ser editadas');
    }

    await this.assertCardsInTenant(data.cards, tenantId);

    const updated = await prisma.$transaction(async (tx) => {
      const updatedReading = await tx.reading.update({
        where: { id },
        data: this.buildDeliveryUpdate(reading, data),
      });

      if (data.cards !== undefined) {
        await tx.readingCard.deleteMany({ where: { readingId: id } });

        if (data.cards.length > 0) {
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
      }

      return updatedReading;
    });

    return { data: await this.toDelivery(updated) };
  }

  async updateStatus(id: string, status: string, tenantId = DEFAULT_TENANT_ID) {
    const reading = await prisma.reading.findFirst({
      where: { id, tenantId },
      include: { client: true },
    });

    if (!reading) {
      throw new NotFoundException('Entrega não encontrada');
    }

    const updateData: any = { status };

    if (status === 'PUBLISHED') {
      updateData.publishedAt = new Date();
      updateData.readingDate = new Date();

      // Send notification email
      if (reading.client.email) {
        await sendEmail({
          to: reading.client.email,
          subject: 'Sua entrega está pronta! - Therapist Platform',
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Olá, ${reading.client.fullName}!</h2>
              <p>Sua entrega "${reading.title || 'Entrega do seu serviço'}" está pronta!</p>
              <p>Acesse sua área de cliente para visualizar todos os detalhes.</p>
              <p>Com carinho,<br>Therapist Platform</p>
            </div>
          `,
        });
      }
    }

    const updated = await prisma.reading.update({
      where: { id },
      data: updateData,
    });

    return { data: await this.toDelivery(updated) };
  }

  async uploadAudio(id: string, file: Express.Multer.File, tenantId = DEFAULT_TENANT_ID) {
    const reading = await prisma.reading.findFirst({
      where: { id, tenantId },
      select: { id: true, audioUrl: true },
    });

    if (!reading) {
      throw new NotFoundException('Entrega não encontrada');
    }

    const fileName = generateFileName(file.originalname);
    const filePath = `${tenantId}/${id}/audio/${fileName}`;

    const audioUrl = await privateMedia.upload(filePath, file.buffer, file.mimetype);

    const updated = await prisma.reading.update({
      where: { id },
      data: { audioUrl },
    });

    return { data: await this.toDelivery(updated) };
  }

  async updateAudio(id: string, audioUrl: string, tenantId = DEFAULT_TENANT_ID) {
    if (audioUrl && !/^https:\/\//i.test(audioUrl)) throw new BadRequestException('Use URL HTTPS ou upload privado');
    const reading = await prisma.reading.findFirst({ where: { id, tenantId } });

    if (!reading) {
      throw new NotFoundException('Entrega não encontrada');
    }

    const updated = await prisma.reading.update({
      where: { id },
      data: { audioUrl },
    });

    return { data: await this.toDelivery(updated) };
  }

  async delete(id: string, tenantId = DEFAULT_TENANT_ID) {
    const reading = await prisma.reading.findFirst({ where: { id, tenantId } });

    if (!reading) {
      throw new NotFoundException('Entrega não encontrada');
    }

    if (reading.status === 'PUBLISHED') {
      throw new BadRequestException('Entregas publicadas não podem ser excluídas');
    }

    await prisma.reading.delete({ where: { id } });

    return { message: 'Entrega excluída com sucesso' };
  }

  async getStats(tenantId = DEFAULT_TENANT_ID) {
    const [total, pending, inProgress, published] = await Promise.all([
      prisma.reading.count({ where: { tenantId } }),
      prisma.reading.count({ where: { tenantId, status: 'PENDING' } }),
      prisma.reading.count({ where: { tenantId, status: 'IN_PROGRESS' } }),
      prisma.reading.count({ where: { tenantId, status: 'PUBLISHED' } }),
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
