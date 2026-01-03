// apps/frontend/src/app/features/client/appointments/appointment-list/appointment-list.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { Tabs, TabsModule } from 'primeng/tabs';
import { DialogModule } from 'primeng/dialog';

import { AppointmentsService, Appointment } from '../../../../core/services/appointments.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    SkeletonModule,
    TabsModule,
    DialogModule,
  ],
  templateUrl: './appointment-list.component.html',
  styleUrl: './appointment-list.component.css',
})
export class AppointmentListComponent implements OnInit {
  private appointmentsService = inject(AppointmentsService);
  private notification = inject(NotificationService);

  upcomingAppointments = signal<Appointment[]>([]);
  pastAppointments = signal<Appointment[]>([]);
  loading = signal(true);

  selectedAppointment = signal<Appointment | null>(null);
  cancelDialogVisible = signal(false);
  cancelling = signal(false);

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.loading.set(true);

    this.appointmentsService.getMyAppointments().subscribe({
      next: (response) => {
        const now = new Date();
        const appointments = response.data;
        
        // Split into upcoming and past
        this.upcomingAppointments.set(
          appointments.filter(a => new Date(a.scheduledDate) >= now && a.status !== 'COMPLETED' && a.status !== 'CANCELLED')
        );
        this.pastAppointments.set(
          appointments.filter(a => new Date(a.scheduledDate) < now || a.status === 'COMPLETED' || a.status === 'CANCELLED')
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
      SCHEDULED: 'Agendado',
      CONFIRMED: 'Confirmado',
      COMPLETED: 'Realizado',
      CANCELLED: 'Cancelado',
      NO_SHOW: 'Não compareceu',
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      SCHEDULED: 'bg-blue-500/20 text-blue-400',
      CONFIRMED: 'bg-green-500/20 text-green-400',
      COMPLETED: 'bg-green-500/20 text-green-400',
      CANCELLED: 'bg-red-500/20 text-red-400',
      NO_SHOW: 'bg-red-500/20 text-red-400',
    };
    return classes[status] || 'bg-gray-500/20 text-gray-400';
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
    return time.substring(0, 5); // Format HH:MM
  }

  isUpcoming(appointment: Appointment): boolean {
    const appointmentDate = new Date(appointment.scheduledDate);
    return appointmentDate > new Date();
  }

  canCancel(appointment: Appointment): boolean {
    if (appointment.status === 'CANCELLED' || appointment.status === 'COMPLETED') {
      return false;
    }
    // Check if more than 24 hours before
    const appointmentDate = new Date(appointment.scheduledDate);
    const now = new Date();
    const diffHours = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours > 24;
  }

  openCancelDialog(appointment: Appointment) {
    this.selectedAppointment.set(appointment);
    this.cancelDialogVisible.set(true);
  }

  confirmCancel() {
    if (!this.selectedAppointment()) return;

    this.cancelling.set(true);

    this.appointmentsService.cancel(this.selectedAppointment()!.id).subscribe({
      next: () => {
        this.notification.success('Agendamento cancelado com sucesso');
        this.cancelDialogVisible.set(false);
        this.cancelling.set(false);
        this.loadAppointments();
      },
      error: (err) => {
        this.notification.error(err.error?.message || 'Erro ao cancelar agendamento');
        this.cancelling.set(false);
      },
    });
  }

  joinMeeting(meetingUrl: string) {
    window.open(meetingUrl, '_blank');
  }
}
