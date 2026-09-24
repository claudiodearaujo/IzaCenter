import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../core/services/notification.service';
import {
  AuditEvent,
  PrivacyRequest,
  PrivacyService,
  RetentionPolicy,
  SecurityIncident,
} from '../../../core/services/privacy.service';
import {
  DsBadgeComponent,
  DsButtonComponent,
  DsCardComponent,
  DsEmptyStateComponent,
  DsFormFieldComponent,
  DsPageHeaderComponent,
} from '../../../shared/design-system';

type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info';

@Component({
  selector: 'app-admin-privacy',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DsBadgeComponent,
    DsButtonComponent,
    DsCardComponent,
    DsEmptyStateComponent,
    DsFormFieldComponent,
    DsPageHeaderComponent,
  ],
  templateUrl: './privacy.component.html',
  styleUrl: './privacy.component.css',
})
export class AdminPrivacyComponent implements OnInit {
  private privacy = inject(PrivacyService);
  private notification = inject(NotificationService);

  requests = signal<PrivacyRequest[]>([]);
  auditEvents = signal<AuditEvent[]>([]);
  incidents = signal<SecurityIncident[]>([]);
  retentionReport = signal<any>(null);
  loading = signal(true);
  savingRetention = signal(false);
  savingContact = signal(false);
  creatingIncident = signal(false);
  updatingRequestId = signal<string | null>(null);
  updatingIncidentId = signal<string | null>(null);

  retention: Pick<
    RetentionPolicy,
    'auditRetentionDays' | 'privacyRequestRetentionDays' | 'operationalLogRetentionDays'
  > = {
    auditRetentionDays: 730,
    privacyRequestRetentionDays: 1825,
    operationalLogRetentionDays: 90,
  };

  requestStatuses: Record<string, string> = {};
  responseMessages: Record<string, string> = {};
  incidentStatuses: Record<string, string> = {};

  privacyContact = {
    name: '',
    email: '',
    url: '',
  };

  incidentForm = {
    title: '',
    summary: '',
    severity: 'MEDIUM',
    detectedAt: '',
    controllerAwareAt: '',
    affectedDataCategories: '',
  };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    let pending = 6;
    const done = () => {
      pending -= 1;
      if (pending === 0) this.loading.set(false);
    };

    this.privacy.contact().subscribe({
      next: (response) => {
        this.privacyContact = {
          name: typeof response.data.name === 'string' ? response.data.name : '',
          email: typeof response.data.email === 'string' ? response.data.email : '',
          url: typeof response.data.url === 'string' ? response.data.url : '',
        };
        done();
      },
      error: () => done(),
    });

    this.privacy.adminRequests().subscribe({
      next: (response) => {
        this.requests.set(response.data);
        for (const item of response.data) {
          this.requestStatuses[item.id] = item.status;
          this.responseMessages[item.id] = item.responseMessage || '';
        }
        done();
      },
      error: () => done(),
    });

    this.privacy.retention().subscribe({
      next: (response) => {
        this.retention = {
          auditRetentionDays: response.data.auditRetentionDays,
          privacyRequestRetentionDays: response.data.privacyRequestRetentionDays,
          operationalLogRetentionDays: response.data.operationalLogRetentionDays,
        };
        done();
      },
      error: () => done(),
    });

    this.privacy.retentionReport().subscribe({
      next: (response) => {
        this.retentionReport.set(response.data);
        done();
      },
      error: () => done(),
    });

    this.privacy.audit().subscribe({
      next: (response) => {
        this.auditEvents.set(response.data);
        done();
      },
      error: () => done(),
    });

    this.privacy.incidents().subscribe({
      next: (response) => {
        this.incidents.set(response.data);
        for (const incident of response.data) {
          this.incidentStatuses[incident.id] = incident.status;
        }
        done();
      },
      error: () => done(),
    });
  }

  saveContact(): void {
    if (!this.privacyContact.name.trim() || !this.privacyContact.email.trim()) {
      this.notification.showWarning('Informe nome e e-mail do canal de privacidade.');
      return;
    }

    this.savingContact.set(true);
    this.privacy.updateContact({
      name: this.privacyContact.name.trim(),
      email: this.privacyContact.email.trim(),
      url: this.privacyContact.url.trim() || undefined,
    }).subscribe({
      next: () => {
        this.savingContact.set(false);
        this.notification.showSuccess('Canal de privacidade atualizado.');
      },
      error: (error) => {
        this.savingContact.set(false);
        this.notification.showError(
          error.error?.message || 'Não foi possível atualizar o canal de privacidade.'
        );
      },
    });
  }

  updateRequest(request: PrivacyRequest): void {
    this.updatingRequestId.set(request.id);
    this.privacy
      .updateRequest(
        request.id,
        this.requestStatuses[request.id],
        this.responseMessages[request.id]?.trim() || undefined
      )
      .subscribe({
        next: () => {
          this.updatingRequestId.set(null);
          this.notification.showSuccess('Solicitação atualizada.');
          this.load();
        },
        error: (error) => {
          this.updatingRequestId.set(null);
          this.notification.showError(
            error.error?.message || 'Não foi possível atualizar a solicitação.'
          );
        },
      });
  }

  saveRetention(): void {
    this.savingRetention.set(true);
    this.privacy.updateRetention(this.retention).subscribe({
      next: () => {
        this.savingRetention.set(false);
        this.notification.showSuccess('Política de retenção atualizada.');
        this.load();
      },
      error: (error) => {
        this.savingRetention.set(false);
        this.notification.showError(
          error.error?.message || 'Não foi possível atualizar a retenção.'
        );
      },
    });
  }

  createIncident(): void {
    const categories = this.incidentForm.affectedDataCategories
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (
      !this.incidentForm.title.trim() ||
      !this.incidentForm.summary.trim() ||
      !this.incidentForm.detectedAt ||
      !this.incidentForm.controllerAwareAt ||
      categories.length === 0
    ) {
      this.notification.showWarning('Preencha os campos obrigatórios do incidente.');
      return;
    }

    this.creatingIncident.set(true);
    this.privacy
      .createIncident({
        title: this.incidentForm.title.trim(),
        summary: this.incidentForm.summary.trim(),
        severity: this.incidentForm.severity,
        detectedAt: this.incidentForm.detectedAt,
        controllerAwareAt: this.incidentForm.controllerAwareAt,
        affectedDataCategories: categories,
      })
      .subscribe({
        next: () => {
          this.creatingIncident.set(false);
          this.notification.showSuccess('Incidente registrado.');
          this.incidentForm = {
            title: '',
            summary: '',
            severity: 'MEDIUM',
            detectedAt: '',
            controllerAwareAt: '',
            affectedDataCategories: '',
          };
          this.load();
        },
        error: (error) => {
          this.creatingIncident.set(false);
          this.notification.showError(
            error.error?.message || 'Não foi possível registrar o incidente.'
          );
        },
      });
  }

  updateIncident(incident: SecurityIncident): void {
    this.updatingIncidentId.set(incident.id);
    this.privacy.updateIncident(incident.id, {
      status: this.incidentStatuses[incident.id],
    }).subscribe({
      next: () => {
        this.updatingIncidentId.set(null);
        this.notification.showSuccess('Incidente atualizado.');
        this.load();
      },
      error: (error) => {
        this.updatingIncidentId.set(null);
        this.notification.showError(
          error.error?.message || 'Não foi possível atualizar o incidente.'
        );
      },
    });
  }

  statusTone(status: string): Tone {
    if (['COMPLETED', 'APPROVED', 'RESOLVED', 'CLOSED', 'SUCCESS'].includes(status)) return 'success';
    if (['REJECTED', 'CANCELED', 'FAILURE', 'CRITICAL'].includes(status)) return 'error';
    if (['IN_REVIEW', 'INVESTIGATING', 'CONTAINED'].includes(status)) return 'info';
    return 'warning';
  }

  severityTone(severity: string): Tone {
    if (severity === 'CRITICAL' || severity === 'HIGH') return 'error';
    if (severity === 'MEDIUM') return 'warning';
    return 'neutral';
  }

  formatDate(value?: string | null): string {
    if (!value) return '—';
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(value));
  }
}
