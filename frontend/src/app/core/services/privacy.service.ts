import { Injectable, inject } from '@angular/core';
import { ApiResponse, ApiService } from './api.service';

export type PrivacyRequestType =
  | 'ACCESS'
  | 'CONFIRMATION'
  | 'CORRECTION'
  | 'PORTABILITY'
  | 'ANONYMIZATION'
  | 'DELETION'
  | 'INFORMATION'
  | 'CONSENT_WITHDRAWAL';

export interface PrivacyRequest {
  id: string;
  type: PrivacyRequestType;
  status: string;
  details?: string | null;
  responseMessage?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  requester?: { id: string; fullName: string; email: string };
  reviewedBy?: { id: string; fullName: string } | null;
}

export interface PrivacyContact {
  name: unknown;
  email: unknown;
  url: unknown;
}

export interface RetentionPolicy {
  id: string;
  tenantId: string;
  auditRetentionDays: number;
  privacyRequestRetentionDays: number;
  operationalLogRetentionDays: number;
}

export interface SecurityIncident {
  id: string;
  title: string;
  summary: string;
  severity: string;
  status: string;
  detectedAt: string;
  controllerAwareAt: string;
  affectedDataCategories: string[];
  affectedSubjectsEstimate?: number | null;
  riskRelevant?: boolean | null;
  anpdNotifiedAt?: string | null;
  subjectsNotifiedAt?: string | null;
  resolutionSummary?: string | null;
}

export interface AuditEvent {
  id: string;
  actorUserId?: string | null;
  action: string;
  resourceType?: string | null;
  resourceId?: string | null;
  method: string;
  path: string;
  statusCode?: number | null;
  outcome: 'SUCCESS' | 'FAILURE';
  requestId: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class PrivacyService {
  private api = inject(ApiService);

  exportData() {
    return this.api.getBlob('/privacy/export');
  }

  contact() {
    return this.api.get<ApiResponse<PrivacyContact>>('/privacy/contact');
  }

  myRequests() {
    return this.api.get<ApiResponse<PrivacyRequest[]>>('/privacy/requests/me');
  }

  createRequest(type: PrivacyRequestType, details?: string) {
    return this.api.post<ApiResponse<PrivacyRequest>>('/privacy/requests', { type, details });
  }

  adminRequests() {
    return this.api.get<{ success: boolean; data: PrivacyRequest[]; meta: any }>(
      '/admin/privacy/requests',
      { params: { page: 1, limit: 100 } }
    );
  }

  updateRequest(id: string, status: string, responseMessage?: string) {
    return this.api.patch<ApiResponse<PrivacyRequest>>(
      `/admin/privacy/requests/${id}`,
      { status, responseMessage }
    );
  }

  retention() {
    return this.api.get<ApiResponse<RetentionPolicy>>('/admin/privacy/retention');
  }

  updateRetention(policy: Pick<RetentionPolicy,
    'auditRetentionDays' | 'privacyRequestRetentionDays' | 'operationalLogRetentionDays'
  >) {
    return this.api.patch<ApiResponse<RetentionPolicy>>('/admin/privacy/retention', policy);
  }

  retentionReport() {
    return this.api.get<ApiResponse<any>>('/admin/privacy/retention/report');
  }

  audit() {
    return this.api.get<{ success: boolean; data: AuditEvent[]; meta: any }>(
      '/admin/privacy/audit',
      { params: { page: 1, limit: 50 } }
    );
  }

  incidents() {
    return this.api.get<ApiResponse<SecurityIncident[]>>('/admin/privacy/incidents');
  }

  createIncident(data: {
    title: string;
    summary: string;
    severity: string;
    detectedAt: string;
    controllerAwareAt: string;
    affectedDataCategories: string[];
  }) {
    return this.api.post<ApiResponse<SecurityIncident>>('/admin/privacy/incidents', data);
  }
}
