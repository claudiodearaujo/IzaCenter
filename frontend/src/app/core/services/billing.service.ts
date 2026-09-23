import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, ApiService } from './api.service';

export type SaasPlanKey = 'starter' | 'professional' | 'studio';

export interface SaasEntitlements {
  branding: boolean;
  customDomain: boolean;
  advancedReports: boolean;
  teamMembers: number;
  specialtyModules: number | null;
}

export interface SaasPlan {
  key: SaasPlanKey;
  name: string;
  description: string;
  monthlyPriceCents: number | null;
  currency: 'BRL';
  entitlements: SaasEntitlements;
  checkoutAvailable?: boolean;
}

export interface SaasSubscriptionView {
  status: string;
  planKey: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  hasBillingCustomer: boolean;
}

export interface BillingCurrent {
  billingEnabled: boolean;
  plan: SaasPlan;
  subscription: SaasSubscriptionView;
  plans: SaasPlan[];
}

@Injectable({ providedIn: 'root' })
export class BillingService {
  private api = inject(ApiService);

  getCurrent(): Observable<ApiResponse<BillingCurrent>> {
    return this.api.get<ApiResponse<BillingCurrent>>('/billing/current');
  }

  getPlans(): Observable<ApiResponse<{ billingEnabled: boolean; plans: SaasPlan[] }>> {
    return this.api.get<ApiResponse<{ billingEnabled: boolean; plans: SaasPlan[] }>>('/billing/plans');
  }

  createCheckout(planKey: Exclude<SaasPlanKey, 'starter'>) {
    return this.api.post<ApiResponse<{ checkoutUrl: string; sessionId: string }>>(
      '/billing/checkout',
      { planKey }
    );
  }

  createPortal() {
    return this.api.post<ApiResponse<{ portalUrl: string }>>('/billing/portal', {});
  }
}
