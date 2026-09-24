import { safeLogPath } from '../../utils/privacy-log.util';
import crypto from 'crypto';
import { AuditOutcome, Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { env } from '../../config/env';

export interface AuditEventInput {
  tenantId?: string | null;
  actorUserId?: string | null;
  action: string;
  resourceType?: string | null;
  resourceId?: string | null;
  method: string;
  path: string;
  statusCode?: number | null;
  outcome: AuditOutcome;
  requestId: string;
  ip?: string | null;
  metadata?: Prisma.InputJsonValue;
}

export class AuditService {
  hashIp(ip?: string | null): string | null {
    if (!ip || !env.AUDIT_IP_HASH_SALT) return null;
    return crypto
      .createHmac('sha256', env.AUDIT_IP_HASH_SALT)
      .update(ip)
      .digest('hex');
  }

  async record(input: AuditEventInput): Promise<void> {
    await prisma.auditEvent.create({
      data: {
        tenantId: input.tenantId || null,
        actorUserId: input.actorUserId || null,
        action: input.action,
        resourceType: input.resourceType || null,
        resourceId: input.resourceId || null,
        method: input.method,
        path: safeLogPath(input.path),
        statusCode: input.statusCode ?? null,
        outcome: input.outcome,
        requestId: input.requestId,
        ipHash: this.hashIp(input.ip),
        metadata: input.metadata,
      },
    });
  }

  async list(
    tenantId: string,
    options: { page: number; limit: number; action?: string }
  ) {
    const where: Prisma.AuditEventWhereInput = {
      tenantId,
      ...(options.action ? { action: { contains: options.action, mode: 'insensitive' } } : {}),
    };

    const [data, total] = await Promise.all([
      prisma.auditEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
        select: {
          id: true,
          actorUserId: true,
          action: true,
          resourceType: true,
          resourceId: true,
          method: true,
          path: true,
          statusCode: true,
          outcome: true,
          requestId: true,
          metadata: true,
          createdAt: true,
        },
      }),
      prisma.auditEvent.count({ where }),
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
}

export const auditService = new AuditService();
