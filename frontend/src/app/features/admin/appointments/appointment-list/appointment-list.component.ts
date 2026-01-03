// apps/frontend/src/app/features/admin/appointments/appointment-list/appointment-list.component.ts

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { DatePicker } from 'primeng/datepicker';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

import { AppointmentsService, Appointment } from '../../../../core/services/appointments.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-admin-appointment-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    Select,
    TagModule,
    DialogModule,
    DatePicker,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './appointment-list.component.html',
  styleUrl: './appointment-list.component.css',
})
export class AdminAppointmentListComponent implements OnInit {
  private appointmentsService = inject(AppointmentsService);
  private notification = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);

  appointments = signal<Appointment[]>([]);
  loading = signal(true);
  totalRecords = signal(0);

  // Computed stats
  upcomingCount = computed(() => 
    this.appointments().filter(a => a.status === 'SCHEDULED' || a.status === 'CONFIRMED').length
  );
  todayCount = computed(() => 
    this.appointments().filter(a => this.isToday(a.scheduledDate)).length
  );
  completedCount = computed(() => 
    this.appointments().filter(a => a.status === 'COMPLETED').length
  );
  cancelledCount = computed(() => 
    this.appointments().filter(a => a.status === 'CANCELLED' || a.status === 'NO_SHOW').length
  );

  selectedStatus: string | null = null;
  searchTerm = '';

  statusOptions = [
    { label: 'Todos', value: null },
    { label: 'Agendado', value: 'SCHEDULED' },
    { label: 'Confirmado', value: 'CONFIRMED' },
    { label: 'Em andamento', value: 'IN_PROGRESS' },
    { label: 'Concluído', value: 'COMPLETED' },
    { label: 'Cancelado', value: 'CANCELLED' },
    { label: 'Não compareceu', value: 'NO_SHOW' },
  ];

  // Reschedule Dialog
  rescheduleDialogVisible = signal(false);
  selectedAppointment = signal<Appointment | null>(null);
  newDateTime: Date | null = null;
  minDate = new Date(); // Current date for date picker
  saving = signal(false);

  // Notes Dialog
  notesDialogVisible = signal(false);
  notes = '';

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments(event?: any) {
    this.loading.set(true);

    const params: any = {
      page: event?.first ? Math.floor(event.first / (event.rows || 10)) + 1 : 1,
      limit: event?.rows || 10,
    };

    if (this.selectedStatus) {
      params.status = this.selectedStatus;
    }

    if (this.searchTerm) {
      params.search = this.searchTerm;
    }

    this.appointmentsService.findAll(params).subscribe({
      next: (response) => {
        this.appointments.set(response.data);
        this.totalRecords.set(response.meta.total);
        this.loading.set(false);
      },
      error: () => {
        this.appointments.set([]);
        this.loading.set(false);
      },
    });
  }

  onSearch() {
    this.loadAppointments();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      SCHEDULED: 'Agendado',
      CONFIRMED: 'Confirmado',
      IN_PROGRESS: 'Em andamento',
      COMPLETED: 'Concluído',
      CANCELLED: 'Cancelado',
      NO_SHOW: 'Não compareceu',
    };
    return labels[status] || status;
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severities: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      SCHEDULED: 'info',
      CONFIRMED: 'success',
      IN_PROGRESS: 'warn',
      COMPLETED: 'success',
      CANCELLED: 'danger',
      NO_SHOW: 'secondary',
    };
    return severities[status] || 'info';
  }

  formatDateTime(date: Date | string): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  confirmAppointment(appointment: Appointment) {
    this.updateStatus(appointment.id, 'CONFIRMED', 'Agendamento confirmado!');
  }

  startAppointment(appointment: Appointment) {
    this.updateStatus(appointment.id, 'IN_PROGRESS', 'Consulta iniciada!');
  }

  completeAppointment(appointment: Appointment) {
    this.updateStatus(appointment.id, 'COMPLETED', 'Consulta concluída!');
  }

  markNoShow(appointment: Appointment) {
    this.confirmationService.confirm({
      message: `Marcar como "Não compareceu"? Isso notificará o cliente.`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.updateStatus(appointment.id, 'NO_SHOW', 'Marcado como não compareceu');
      },
    });
  }

  updateStatus(id: string, status: string, message: string) {
    this.appointmentsService.updateStatus(id, status).subscribe({
      next: () => {
        this.notification.success(message);
        this.loadAppointments();
      },
      error: () => {
        this.notification.error('Erro ao atualizar status');
      },
    });
  }

  openRescheduleDialog(appointment: Appointment) {
    this.selectedAppointment.set(appointment);
    this.newDateTime = new Date(appointment.scheduledDate);
    this.rescheduleDialogVisible.set(true);
  }

  reschedule() {
    if (!this.newDateTime || !this.selectedAppointment()) {
      return;
    }

    this.saving.set(true);

    const appointment = this.selectedAppointment()!;
    const startTime = this.newDateTime.toTimeString().slice(0, 5);
    // Calculate end time based on duration
    const endDate = new Date(this.newDateTime.getTime() + (appointment.durationMinutes || 60) * 60000);
    const endTime = endDate.toTimeString().slice(0, 5);

    this.appointmentsService
      .reschedule(appointment.id, this.newDateTime, startTime, endTime)
      .subscribe({
        next: () => {
          this.notification.success('Agendamento reagendado! O cliente será notificado.');
          this.rescheduleDialogVisible.set(false);
          this.selectedAppointment.set(null);
          this.loadAppointments();
          this.saving.set(false);
        },
        error: () => {
          this.notification.error('Erro ao reagendar');
          this.saving.set(false);
        },
      });
  }

  openNotesDialog(appointment: Appointment) {
    this.selectedAppointment.set(appointment);
    this.notes = appointment.adminNotes || '';
    this.notesDialogVisible.set(true);
  }

  saveNotes() {
    if (!this.selectedAppointment()) return;

    this.saving.set(true);

    this.appointmentsService
      .update(this.selectedAppointment()!.id, { adminNotes: this.notes })
      .subscribe({
        next: () => {
          this.notification.success('Anotações salvas!');
          this.notesDialogVisible.set(false);
          this.loadAppointments();
          this.saving.set(false);
        },
        error: () => {
          this.notification.error('Erro ao salvar');
          this.saving.set(false);
        },
      });
  }

  cancelAppointment(appointment: Appointment) {
    this.confirmationService.confirm({
      message: `Deseja cancelar este agendamento? O cliente será notificado e poderá receber reembolso.`,
      header: 'Confirmar Cancelamento',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, cancelar',
      rejectLabel: 'Não',
      accept: () => {
        this.updateStatus(appointment.id, 'CANCELLED', 'Agendamento cancelado');
      },
    });
  }

  isUpcoming(date: Date | string): boolean {
    return new Date(date) > new Date();
  }

  isToday(date: Date | string): boolean {
    const d = new Date(date);
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  }
}
