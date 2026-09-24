import { Prisma, PrivacyRequestStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { Errors } from '../../middlewares/error.middleware';
import { auditService } from './audit.service';

export class PrivacyService {
  async exportUserData(userId: string, tenantId: string) {
    const membership = await prisma.tenantMembership.findUnique({
      where: { tenantId_userId: { tenantId, userId } },
      select: {
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    if (!membership?.isActive) throw Errors.NotFound('Usuário');

    const [user, orders, readings, appointments, testimonials, requests] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          birthDate: true,
          avatarUrl: true,
          preferredLanguage: true,
          notificationEmail: true,
          notificationWhatsapp: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        },
      }),
      prisma.order.findMany({
        where: { tenantId, clientId: userId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          subtotal: true,
          discount: true,
          total: true,
          status: true,
          paymentStatus: true,
          clientNotes: true,
          paidAt: true,
          completedAt: true,
          cancelledAt: true,
          createdAt: true,
          updatedAt: true,
          items: {
            select: {
              id: true,
              productName: true,
              productType: true,
              unitPrice: true,
              quantity: true,
              totalPrice: true,
              clientQuestions: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.reading.findMany({
        where: { tenantId, clientId: userId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          deliveryType: true,
          content: true,
          specialtyModule: true,
          metadata: true,
          clientQuestion: true,
          focusArea: true,
          introduction: true,
          generalGuidance: true,
          recommendations: true,
          goals: true,
          closingMessage: true,
          audioUrl: true,
          videoUrl: true,
          readingDate: true,
          publishedAt: true,
          expiresAt: true,
          pdfUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.appointment.findMany({
        where: { tenantId, clientId: userId },
        orderBy: { scheduledDate: 'desc' },
        select: {
          id: true,
          scheduledDate: true,
          startTime: true,
          endTime: true,
          durationMinutes: true,
          status: true,
          clientNotes: true,
          meetingUrl: true,
          confirmedAt: true,
          cancelledAt: true,
          cancellationReason: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.testimonial.findMany({
        where: { tenantId, clientId: userId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          clientName: true,
          content: true,
          rating: true,
          isApproved: true,
          isFeatured: true,
          createdAt: true,
        },
      }),
      prisma.privacyRequest.findMany({
        where: { tenantId, requesterUserId: userId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          status: true,
          details: true,
          responseMessage: true,
          completedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    if (!user) throw Errors.NotFound('Usuário');

    return {
      exportedAt: new Date().toISOString(),
      scope: { tenantId },
      profile: user,
      membership,
      orders,
      readings,
      appointments,
      testimonials,
      privacyRequests: requests,
    };
  }

  async createRequest(
    tenantId: string,
    requesterUserId: string,
    data: { type: any; details?: string }
  ) {
    return prisma.privacyRequest.create({
      data: {
        tenantId,
        requesterUserId,
        type: data.type,
        details: data.details,
      },
      select: {
        id: true,
        type: true,
        status: true,
        details: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async listMine(tenantId: string, requesterUserId: string) {
    return prisma.privacyRequest.findMany({
      where: { tenantId, requesterUserId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        status: true,
        details: true,
        responseMessage: true,
        completedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async listRequests(
    tenantId: string,
    options: { page: number; limit: number; status?: any; type?: any }
  ) {
    const where: Prisma.PrivacyRequestWhereInput = {
      tenantId,
      ...(options.status ? { status: options.status } : {}),
      ...(options.type ? { type: options.type } : {}),
    };
    const [data, total] = await Promise.all([
      prisma.privacyRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
        include: {
          requester: {
            select: { id: true, fullName: true, email: true },
          },
          reviewedBy: {
            select: { id: true, fullName: true },
          },
        },
      }),
      prisma.privacyRequest.count({ where }),
    ]);
    return {
      data,
      meta: {
        page: options.page,
        limit: options.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / options.limit)),
      },
    };
  }

  async getRequest(tenantId: string, id: string) {
    const request = await prisma.privacyRequest.findFirst({
      where: { id, tenantId },
      include: {
        requester: { select: { id: true, fullName: true, email: true } },
        reviewedBy: { select: { id: true, fullName: true } },
      },
    });
    if (!request) throw Errors.NotFound('Solicitação de privacidade');
    return request;
  }

  async updateRequest(
    tenantId: string,
    id: string,
    reviewerUserId: string,
    data: { status: PrivacyRequestStatus; responseMessage?: string },
    requestId: string
  ) {
    const current = await prisma.privacyRequest.findFirst({
      where: { id, tenantId },
      select: { id: true, status: true },
    });
    if (!current) throw Errors.NotFound('Solicitação de privacidade');

    const completedAt = ['COMPLETED', 'REJECTED', 'CANCELED'].includes(data.status)
      ? new Date()
      : null;

    const updated = await prisma.privacyRequest.update({
      where: { id },
      data: {
        status: data.status,
        responseMessage: data.responseMessage,
        reviewedByUserId: reviewerUserId,
        completedAt,
      },
    });

    await auditService.record({
      tenantId,
      actorUserId: reviewerUserId,
      action: 'privacy.request.status_changed',
      resourceType: 'PrivacyRequest',
      resourceId: id,
      method: 'PATCH',
      path: '/admin/privacy/requests/:id',
      statusCode: 200,
      outcome: 'SUCCESS',
      requestId,
      metadata: {
        previousStatus: current.status,
        newStatus: data.status,
      },
    });

    return updated;
  }

  async getRetentionPolicy(tenantId: string) {
    return prisma.dataRetentionPolicy.upsert({
      where: { tenantId },
      create: { tenantId },
      update: {},
    });
  }

  async updateRetentionPolicy(
    tenantId: string,
    data: {
      auditRetentionDays: number;
      privacyRequestRetentionDays: number;
      operationalLogRetentionDays: number;
    }
  ) {
    return prisma.dataRetentionPolicy.upsert({
      where: { tenantId },
      create: { tenantId, ...data },
      update: data,
    });
  }

  async retentionReport(tenantId: string) {
    const policy = await this.getRetentionPolicy(tenantId);
    const now = Date.now();
    const auditBefore = new Date(now - policy.auditRetentionDays * 86400000);
    const privacyBefore = new Date(now - policy.privacyRequestRetentionDays * 86400000);

    const [auditEligible, privacyEligible] = await Promise.all([
      prisma.auditEvent.count({ where: { tenantId, createdAt: { lt: auditBefore } } }),
      prisma.privacyRequest.count({
        where: {
          tenantId,
          createdAt: { lt: privacyBefore },
          status: { in: ['COMPLETED', 'REJECTED', 'CANCELED'] },
        },
      }),
    ]);

    return {
      policy,
      eligible: {
        auditEvents: auditEligible,
        closedPrivacyRequests: privacyEligible,
      },
      destructiveCleanupEnabled: false,
    };
  }

  async listIncidents(tenantId: string) {
    return prisma.securityIncident.findMany({
      where: { tenantId },
      orderBy: [{ status: 'asc' }, { controllerAwareAt: 'desc' }],
    });
  }

  async createIncident(tenantId: string, userId: string, data: any) {
    return prisma.securityIncident.create({
      data: {
        tenantId,
        createdByUserId: userId,
        ...data,
      },
    });
  }

  async updateIncident(tenantId: string, id: string, data: any) {
    const incident = await prisma.securityIncident.findFirst({ where: { id, tenantId } });
    if (!incident) throw Errors.NotFound('Incidente');
    return prisma.securityIncident.update({ where: { id }, data });
  }

  async getPrivacyContact(tenantId: string) {
    const rows = await prisma.siteSetting.findMany({
      where: {
        tenantId,
        key: {
          in: [
            'privacyContactName',
            'privacyContactEmail',
            'privacyContactUrl',
            'contact',
            'professional',
          ],
        },
      },
      select: { key: true, value: true },
    });
    const values = Object.fromEntries(rows.map((row) => [row.key, row.value]));
    const contact = (values.contact || {}) as Record<string, unknown>;
    const professional = (values.professional || {}) as Record<string, unknown>;

    return {
      name:
        values.privacyContactName ||
        professional.displayName ||
        null,
      email:
        values.privacyContactEmail ||
        contact.email ||
        null,
      url: values.privacyContactUrl || null,
    };
  }
}

export const privacyService = new PrivacyService();
