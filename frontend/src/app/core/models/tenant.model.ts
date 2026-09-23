export type TenantMembershipRole = 'OWNER' | 'ADMIN' | 'CLIENT';

export interface TenantMembership {
  id?: string;
  role: TenantMembershipRole;
  isActive: boolean;
}

export interface TenantContext {
  id: string;
  name: string;
  slug: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  planKey: string;
  customDomain?: string | null;
  onboardingCompletedAt?: string | null;
}
