import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '../models/user.model';
import { TenantContext, TenantMembership } from '../models/tenant.model';

export interface ProfessionalOnboardingRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  tenantName: string;
  tenantSlug: string;
  professionalTitle: string;
  serviceMode: 'ONLINE' | 'IN_PERSON' | 'HYBRID';
  contactEmail?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export interface ProfessionalOnboardingResponse {
  success: boolean;
  message: string;
  data: {
    tenant: TenantContext;
    membership: TenantMembership;
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private api = inject(ApiService);

  createProfessional(
    data: ProfessionalOnboardingRequest
  ): Observable<ProfessionalOnboardingResponse> {
    return this.api.post<ProfessionalOnboardingResponse>(
      '/onboarding/professional',
      data
    );
  }
}
