import { z } from 'zod';

export const createPrivacyRequestSchema = z.object({
  type: z.enum([
    'ACCESS',
    'CONFIRMATION',
    'CORRECTION',
    'PORTABILITY',
    'ANONYMIZATION',
    'DELETION',
    'INFORMATION',
    'CONSENT_WITHDRAWAL',
  ]),
  details: z.string().trim().max(4000).optional(),
});

export const listPrivacyRequestsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z
    .enum(['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELED'])
    .optional(),
  type: z
    .enum([
      'ACCESS',
      'CONFIRMATION',
      'CORRECTION',
      'PORTABILITY',
      'ANONYMIZATION',
      'DELETION',
      'INFORMATION',
      'CONSENT_WITHDRAWAL',
    ])
    .optional(),
});

export const updatePrivacyRequestSchema = z.object({
  status: z.enum(['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELED']),
  responseMessage: z.string().trim().max(8000).optional(),
});

export const updateRetentionPolicySchema = z.object({
  auditRetentionDays: z.number().int().min(30).max(3650),
  privacyRequestRetentionDays: z.number().int().min(365).max(3650),
  operationalLogRetentionDays: z.number().int().min(7).max(365),
});

export const createIncidentSchema = z.object({
  title: z.string().trim().min(3).max(200),
  summary: z.string().trim().min(3).max(8000),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  detectedAt: z.coerce.date(),
  controllerAwareAt: z.coerce.date(),
  affectedDataCategories: z.array(z.string().trim().min(1).max(100)).max(30),
  affectedSubjectsEstimate: z.number().int().min(0).nullable().optional(),
  riskRelevant: z.boolean().nullable().optional(),
});

export const updateIncidentSchema = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  summary: z.string().trim().min(3).max(8000).optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  status: z.enum(['OPEN', 'INVESTIGATING', 'CONTAINED', 'RESOLVED', 'CLOSED']).optional(),
  riskRelevant: z.boolean().nullable().optional(),
  anpdNotifiedAt: z.coerce.date().nullable().optional(),
  subjectsNotifiedAt: z.coerce.date().nullable().optional(),
  resolutionSummary: z.string().trim().max(8000).nullable().optional(),
});

export const listAuditSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  action: z.string().trim().max(100).optional(),
});

export const privacyIdParamsSchema = z.object({
  id: z.string().uuid(),
});
