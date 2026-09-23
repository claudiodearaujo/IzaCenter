import { env } from '../../config/env';

export type SaasPlanKey = 'starter' | 'professional' | 'studio';

export interface SaasEntitlements {
  branding: boolean;
  customDomain: boolean;
  advancedReports: boolean;
  teamMembers: number;
  specialtyModules: number | null;
}

export interface PublicSaasPlan {
  key: SaasPlanKey;
  name: string;
  description: string;
  monthlyPriceCents: number | null;
  currency: 'BRL';
  entitlements: SaasEntitlements;
  checkoutAvailable: boolean;
}

interface InternalSaasPlan extends PublicSaasPlan {
  priceId: string | null;
}

function plan(
  key: SaasPlanKey,
  name: string,
  description: string,
  monthlyPriceCents: number | null,
  priceId: string | null,
  entitlements: SaasEntitlements
): InternalSaasPlan {
  return {
    key,
    name,
    description,
    monthlyPriceCents,
    currency: 'BRL',
    priceId,
    entitlements,
    checkoutAvailable:
      key !== 'starter' &&
      env.SAAS_BILLING_ENABLED &&
      Boolean(priceId),
  };
}

export function getSaasPlanCatalog(): Record<SaasPlanKey, InternalSaasPlan> {
  return {
    starter: plan(
      'starter',
      'Starter',
      'Base segura para iniciar e publicar seu espaço profissional.',
      0,
      null,
      {
        branding: true,
        customDomain: false,
        advancedReports: false,
        teamMembers: 1,
        specialtyModules: 1,
      }
    ),
    professional: plan(
      'professional',
      'Professional',
      'Recursos avançados para profissionais independentes.',
      env.SAAS_PROFESSIONAL_MONTHLY_PRICE_CENTS,
      env.SAAS_PROFESSIONAL_PRICE_ID || null,
      {
        branding: true,
        customDomain: true,
        advancedReports: true,
        teamMembers: 3,
        specialtyModules: 5,
      }
    ),
    studio: plan(
      'studio',
      'Studio',
      'Estrutura ampliada para equipes e múltiplas especialidades.',
      env.SAAS_STUDIO_MONTHLY_PRICE_CENTS,
      env.SAAS_STUDIO_PRICE_ID || null,
      {
        branding: true,
        customDomain: true,
        advancedReports: true,
        teamMembers: 10,
        specialtyModules: null,
      }
    ),
  };
}

export function getPublicSaasPlans(): PublicSaasPlan[] {
  return Object.values(getSaasPlanCatalog()).map(({ priceId: _priceId, ...plan }) => plan);
}

export function getSaasPlan(key: string): InternalSaasPlan | null {
  const catalog = getSaasPlanCatalog();
  return catalog[key as SaasPlanKey] || null;
}

export function findPlanByPriceId(priceId?: string | null): InternalSaasPlan | null {
  if (!priceId) return null;
  return Object.values(getSaasPlanCatalog()).find((plan) => plan.priceId === priceId) || null;
}
