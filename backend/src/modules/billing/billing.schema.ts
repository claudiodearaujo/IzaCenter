import { z } from 'zod';

export const createSaasCheckoutSchema = z.object({
  planKey: z.enum(['professional', 'studio']),
});

export type CreateSaasCheckoutDto = z.infer<typeof createSaasCheckoutSchema>;
