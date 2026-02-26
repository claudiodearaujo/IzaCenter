// apps/frontend/src/app/features/client/appointments/appointment-booking/appointment-booking.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { DatePicker } from 'primeng/datepicker';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { AppointmentsService, TimeSlot } from '../../../../core/services/appointments.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-appointment-booking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TranslateModule,
    ButtonModule,
    TextareaModule,
    DatePicker,
    ProgressSpinnerModule,
  ],
  templateUrl: './appointment-booking.component.html',
  styleUrl: './appointment-booking.component.css',
})
export class AppointmentBookingComponent implements OnInit {
  private appointmentsService = inject(AppointmentsService);
  private notification = inject(NotificationService);
  private translate = inject(TranslateService);
  private router = inject(Router);

  selectedDate = signal<Date | null>(null);
  slots = signal<TimeSlot[]>([]);
  selectedSlot = signal<TimeSlot | null>(null);
  clientNotes = signal('');

  loadingSlots = signal(false);
  submitting = signal(false);

  minDate = new Date();

  ngOnInit() {
    // set min date to tomorrow
    this.minDate = new Date();
    this.minDate.setDate(this.minDate.getDate() + 1);
  }

  onDateChange(date: Date | null) {
    if (!date) return;
    this.selectedDate.set(date);
    this.selectedSlot.set(null);
    this.loadSlots(date);
  }

  loadSlots(date: Date) {
    this.loadingSlots.set(true);
    this.slots.set([]);

    this.appointmentsService.getAvailableSlots(date).subscribe({
      next: (response) => {
        this.slots.set(response.data);
        this.loadingSlots.set(false);
      },
      error: () => {
        this.slots.set([]);
        this.loadingSlots.set(false);
        this.notification.error(this.translate.instant('client.booking.errorLoadingSlots'));
      },
    });
  }

  selectSlot(slot: TimeSlot) {
    if (!slot.available) return;
    this.selectedSlot.set(slot);
  }

  get availableSlots() {
    return this.slots().filter(s => s.available);
  }

  confirm() {
    const date = this.selectedDate();
    const slot = this.selectedSlot();
    if (!date || !slot) return;

    this.submitting.set(true);

    // Format date as YYYY-MM-DD
    const dateStr = date.toLocaleDateString('sv');

    this.appointmentsService.create({
      date: dateStr,
      startTime: slot.startTime,
      endTime: slot.endTime,
      clientNotes: this.clientNotes() || undefined,
    }).subscribe({
      next: () => {
        this.notification.success(this.translate.instant('client.booking.success'));
        this.router.navigate(['/cliente/agendamentos']);
      },
      error: (err) => {
        this.submitting.set(false);
        this.notification.error(
          err.error?.message || this.translate.instant('client.booking.error')
        );
      },
    });
  }

  formatTime(time: string): string {
    return time.substring(0, 5);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }
}
