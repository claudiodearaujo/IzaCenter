import { env } from '../../config/env';
import { Tenant, TenantMemberRole } from '@prisma/client';
import { prisma } from '../../config/database';
import { DEFAULT_TENANT_ID, DEFAULT_TENANT_SLUG } from './tenant.constants';

export type TenantContext = Pick<Tenant, 'id' | 'name' | 'slug' | 'status' | 'planKey' | 'customDomain'>;

export class TenantService {
  async getDefaultTenant(): Promise<TenantContext | null> {
    return prisma.tenant.findFirst({
      where: {
        status: 'ACTIVE',
        OR: [
          { id: DEFAULT_TENANT_ID },
          { slug: DEFAULT_TENANT_SLUG },
        ],
      },
      select: this.contextSelect(),
    });
  }

  async findActiveBySlug(slug: string): Promise<TenantContext | null> {
    return prisma.tenant.findFirst({
      where: { slug: slug.toLowerCase(), status: 'ACTIVE' },
      select: this.contextSelect(),
    });
  }

  async findActiveByCustomDomain(hostname: string): Promise<TenantContext | null> {
    return prisma.tenant.findFirst({
      where: { customDomain: hostname.toLowerCase(), status: 'ACTIVE' },
      select: this.contextSelect(),
    });
  }

  async resolve(explicitSlug?: string, hostname?: string): Promise<TenantContext | null> {
    const normalizedHost = this.normalizeHostname(hostname);
    const isLocalHost = normalizedHost === 'localhost' || !!normalizedHost?.match(/^\d{1,3}(\.\d{1,3}){3}$/);
    if (normalizedHost && !isLocalHost) {
      // Hostname is authoritative when it maps to a tenant. This prevents a
      // stale X-Tenant-Slug/localStorage selection from overriding a custom
      // domain or tenant subdomain visited explicitly by the user.
      const customDomainTenant = await this.findActiveByCustomDomain(normalizedHost);
      if (customDomainTenant) return customDomainTenant;

      const subdomain = this.extractSubdomain(normalizedHost);
      if (subdomain) {
        const subdomainTenant = await this.findActiveBySlug(subdomain);
        if (subdomainTenant) return subdomainTenant;
      }
    }

    const sharedHosts = [new URL(env.FRONTEND_URL).hostname, new URL(env.BACKEND_URL).hostname];
    const developmentHost = !env.isProduction && isLocalHost;
    if (normalizedHost && !sharedHosts.includes(normalizedHost) && !developmentHost) return null;

    if (explicitSlug) {
      return this.findActiveBySlug(explicitSlug);
    }

    return this.getDefaultTenant();
  }

  async getMembership(tenantId: string, userId: string) {
    return prisma.tenantMembership.findUnique({
      where: {
        tenantId_userId: { tenantId, userId },
      },
      select: {
        id: true,
        role: true,
        isActive: true,
      },
    });
  }

  isAllowedRole(role: TenantMemberRole, allowedRoles?: TenantMemberRole[]): boolean {
    return !allowedRoles?.length || allowedRoles.includes(role);
  }

  private normalizeHostname(hostname?: string): string | null {
    if (!hostname) return null;
    return hostname.split(':')[0].trim().toLowerCase() || null;
  }

  private extractSubdomain(hostname: string): string | null {
    if (hostname === 'localhost' || /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
      return null;
    }

    if (!env.TENANT_BASE_DOMAIN || !hostname.endsWith(`.${env.TENANT_BASE_DOMAIN}`)) return null;
    const parts = hostname.split('.');
    if (parts.length < 3) return null;

    const prefix = hostname.slice(0, -(env.TENANT_BASE_DOMAIN.length + 1));
    if (prefix.includes('.')) return null;
    const candidate = prefix;
    if (!candidate || ['www', 'api'].includes(candidate)) return null;
    return candidate;
  }

  private contextSelect() {
    return {
      id: true,
      name: true,
      slug: true,
      status: true,
      planKey: true,
      customDomain: true,
    } as const;
  }
}

export const tenantService = new TenantService();
