// apps/frontend/src/app/features/admin/availability/availability.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TagModule } from 'primeng/tag';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import {
  SettingsService,
  BusinessHour,
} from '../../../core/services/settings.service';
import { NotificationService } from '../../../core/services/notification.service';

export interface WeekdayConfig {
  day: string;
  dayName: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export interface ScheduleSettings {
  weekdays: WeekdayConfig[];
  slotDuration: number;
  bufferMinutes: number;
  advanceBookingDays: number;
  minNoticeHours: number;
}

const DEFAULT_WEEKDAYS: WeekdayConfig[] = [
  { day: 'monday', dayName: 'Segunda-feira', enabled: true, startTime: '09:00', endTime: '18:00' },
  { day: 'tuesday', dayName: 'Terça-feira', enabled: true, startTime: '09:00', endTime: '18:00' },
  { day: 'wednesday', dayName: 'Quarta-feira', enabled: true, startTime: '09:00', endTime: '18:00' },
  { day: 'thursday', dayName: 'Quinta-feira', enabled: true, startTime: '09:00', endTime: '18:00' },
  { day: 'friday', dayName: 'Sexta-feira', enabled: true, startTime: '09:00', endTime: '18:00' },
  { day: 'saturday', dayName: 'Sábado', enabled: false, startTime: '09:00', endTime: '13:00' },
  { day: 'sunday', dayName: 'Domingo', enabled: false, startTime: '09:00', endTime: '13:00' },
];

@Component({
  selector: 'app-admin-availability',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    Select,
    ToggleButtonModule,
    TagModule,
    TranslateModule,
  ],
  templateUrl: './availability.component.html',
  styleUrl: './availability.component.css',
})
export class AdminAvailabilityComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private notification = inject(NotificationService);
  private translate = inject(TranslateService);

  loading = signal(true);
  saving = signal(false);

  scheduleSettings: ScheduleSettings = {
    weekdays: DEFAULT_WEEKDAYS.map((w) => ({ ...w })),
    slotDuration: 60,
    bufferMinutes: 15,
    advanceBookingDays: 30,
    minNoticeHours: 24,
  };

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.loading.set(true);

    this.settingsService.getBusinessHours().subscribe({
      next: (response) => {
        const hours: BusinessHour[] = response.data || [];
        if (hours.length > 0) {
          this.scheduleSettings.weekdays = this.scheduleSettings.weekdays.map((wd) => {
            const match = hours.find((h) => h.day === wd.day);
            if (match) {
              return {
                ...wd,
                enabled: match.isOpen,
                startTime: match.start || wd.startTime,
                endTime: match.end || wd.endTime,
              };
            }
            return wd;
          });
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  saveSettings() {
    this.saving.set(true);

    const businessHours: BusinessHour[] = this.scheduleSettings.weekdays.map((wd) => ({
      day: wd.day,
      dayName: wd.dayName,
      isOpen: wd.enabled,
      start: wd.startTime,
      end: wd.endTime,
    }));

    this.settingsService.updateBusinessHours(businessHours).subscribe({
      next: () => {
        this.notification.success(
          this.translate.instant('admin.availability.saved')
        );
        this.saving.set(false);
      },
      error: () => {
        this.notification.error(
          this.translate.instant('admin.availability.errorSaving')
        );
        this.saving.set(false);
      },
    });
  }
}
