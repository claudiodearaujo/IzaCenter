import { z } from 'zod';
import { commonSchemas } from '../../middlewares/validate.middleware';

const colorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor deve usar formato hexadecimal #RRGGBB');

export const professionalOnboardingSchema = z.object({
  email: commonSchemas.email,
  password: commonSchemas.password,
  fullName: z.string().min(3).max(100),
  phone: commonSchemas.phone,
  tenantName: z.string().trim().min(3).max(100),
  tenantSlug: z.string()
    .trim()
    .transform((value) => value.toLowerCase())
    .refine(
      (value) => /^[a-z0-9](?:[a-z0-9-]{1,46}[a-z0-9])$/.test(value),
      'Slug deve ter 3 a 48 caracteres, usando letras minúsculas, números e hífen'
    ),
  professionalTitle: z.string().trim().min(2).max(120),
  serviceMode: z.enum(['ONLINE', 'IN_PERSON', 'HYBRID']).default('ONLINE'),
  contactEmail: commonSchemas.email.optional(),
  primaryColor: colorSchema.default('#4f46e5'),
  secondaryColor: colorSchema.default('#7c3aed'),
  accentColor: colorSchema.default('#0ea5e9'),
});

export type ProfessionalOnboardingDto = z.infer<typeof professionalOnboardingSchema>;
