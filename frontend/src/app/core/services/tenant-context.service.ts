import { Injectable, computed, signal } from '@angular/core';
import { TenantContext } from '../models/tenant.model';

const TENANT_SLUG_KEY = 'tenantSlug';
const TENANT_CONTEXT_KEY = 'tenantContext';

@Injectable({ providedIn: 'root' })
export class TenantContextService {
  private tenantSignal = signal<TenantContext | null>(this.readStoredTenant());
  private slugSignal = signal<string | null>(
    this.tenantSignal()?.slug || localStorage.getItem(TENANT_SLUG_KEY)
  );

  readonly tenant = this.tenantSignal.asReadonly();
  readonly slug = this.slugSignal.asReadonly();
  readonly hasExplicitTenant = computed(() => !!this.slugSignal());

  getTenantSlug(): string | null {
    return this.slugSignal();
  }

  selectTenant(tenant: TenantContext): void {
    this.tenantSignal.set(tenant);
    this.slugSignal.set(tenant.slug);
    localStorage.setItem(TENANT_SLUG_KEY, tenant.slug);
    localStorage.setItem(TENANT_CONTEXT_KEY, JSON.stringify(tenant));
  }

  clearSelection(): void {
    this.tenantSignal.set(null);
    this.slugSignal.set(null);
    localStorage.removeItem(TENANT_SLUG_KEY);
    localStorage.removeItem(TENANT_CONTEXT_KEY);
  }

  private readStoredTenant(): TenantContext | null {
    const raw = localStorage.getItem(TENANT_CONTEXT_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as TenantContext;
    } catch {
      localStorage.removeItem(TENANT_CONTEXT_KEY);
      return null;
    }
  }
}
