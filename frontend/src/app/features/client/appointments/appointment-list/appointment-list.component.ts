import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { SkeletonModule } from 'primeng/skeleton';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { DialogModule } from 'primeng/dialog';

import { AppointmentsService, Appointment } from '../../../../core/services/appointments.service';
import { NotificationService } from '../../../../core/services/notification.service';
import {
  DsBadgeComponent,
  DsButtonComponent,
  DsCardComponent,
  DsEmptyStateComponent,
  DsPageHeaderComponent,
} from '../../../../shared/design-system';

type AppointmentTone = 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslateModule,
    SkeletonModule,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    DialogModule,
    DsBadgeComponent,
    DsButtonComponent,
    DsCardComponent,
    DsEmptyStateComponent,
    DsPageHeaderComponent,
  ],
  templateUrl: './appointment-list.component.html',
  styleUrl: './appointment-list.component.css',
})
export class AppointmentListComponent implements OnInit {
  private appointmentsService = inject(AppointmentsService);
  private notification = inject(NotificationService);
  private translate = inject(TranslateService);

  upcomingAppointments = signal<Appointment[]>([]);
  pastAppointments = signal<Appointment[]>([]);
  loading = signal(true);

  selectedAppointment = signal<Appointment | null>(null);
  cancelDialogVisible = signal(false);
  cancelling = signal(false);

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading.set(true);

    this.appointmentsService.getMyAppointments().subscribe({
      next: (response) => {
        const now = new Date();
        const appointments = response.data;

        this.upcomingAppointments.set(
          appointments.filter(
            (a) =>
              new Date(a.scheduledDate) >= now &&
              a.status !== 'COMPLETED' &&
              a.status !== 'CANCELLED'
          )
        );

        this.pastAppointments.set(
          appointments.filter(
            (a) =>
              new Date(a.scheduledDate) < now ||
              a.status === 'COMPLETED' ||
              a.status === 'CANCELLED'
          )
        );

        this.loading.set(false);
      },
      error: () => {
        this.upcomingAppointments.set([]);
        this.pastAppointments.set([]);
        this.loading.set(false);
      },
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      SCHEDULED: this.translate.instant('client.appointments.statusScheduled'),
      CONFIRMED: this.translate.instant('client.appointments.statusConfirmed'),
      COMPLETED: this.translate.instant('client.appointments.statusCompleted'),
      CANCELLED: this.translate.instant('client.appointments.statusCancelled'),
      NO_SHOW: this.translate.instant('client.appointments.statusNoShow'),
    };
    return labels[status] || status;
  }

  getStatusTone(status: string): AppointmentTone {
    const tones: Record<string, AppointmentTone> = {
      SCHEDULED: 'info',
      CONFIRMED: 'success',
      COMPLETED: 'success',
      CANCELLED: 'error',
      NO_SHOW: 'neutral',
    };
    return tones[status] || 'neutral';
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  formatTime(time: string): string {
    return time.substring(0, 5);
  }

  canCancel(appointment: Appointment): boolean {
    if (appointment.status === 'CANCELLED' || appointment.status === 'COMPLETED') {
      return false;
    }

    const appointmentDate = new Date(appointment.scheduledDate);
    const diffHours = (appointmentDate.getTime() - Date.now()) / (1000 * 60 * 60);
    return diffHours > 24;
  }

  openCancelDialog(appointment: Appointment): void {
    this.selectedAppointment.set(appointment);
    this.cancelDialogVisible.set(true);
  }

  confirmCancel(): void {
    if (!this.selectedAppointment()) return;

    this.cancelling.set(true);

    this.appointmentsService.cancel(this.selectedAppointment()!.id).subscribe({
      next: () => {
        this.notification.success(
          this.translate.instant('client.appointments.cancelDialog.success')
        );
        this.cancelDialogVisible.set(false);
        this.cancelling.set(false);
        this.loadAppointments();
      },
      error: (err) => {
        this.notification.error(
          err.error?.message ||
            this.translate.instant('client.appointments.cancelDialog.error')
        );
        this.cancelling.set(false);
      },
    });
  }

  joinMeeting(meetingUrl: string): void {
    window.open(meetingUrl, '_blank', 'noopener,noreferrer');
  }
}
