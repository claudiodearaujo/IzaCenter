import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Tooltip } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ReadingsService, Reading } from '../../../../core/services/readings.service';
import {
  DsAvatarComponent,
  DsBadgeComponent,
  DsButtonComponent,
  DsCardComponent,
  DsEmptyStateComponent,
  DsFormFieldComponent,
  DsPageHeaderComponent,
} from '../../../../shared/design-system';

type DeliveryTone = 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info';

@Component({
  selector: 'app-admin-reading-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    TableModule,
    InputTextModule,
    Select,
    Tooltip,
    SkeletonModule,
    TranslateModule,
    DsAvatarComponent,
    DsBadgeComponent,
    DsButtonComponent,
    DsCardComponent,
    DsEmptyStateComponent,
    DsFormFieldComponent,
    DsPageHeaderComponent,
  ],
  templateUrl: './reading-list.component.html',
  styleUrl: './reading-list.component.css',
})
export class AdminReadingListComponent implements OnInit {
  private readingsService = inject(ReadingsService);
  private translate = inject(TranslateService);

  readings = signal<Reading[]>([]);
  loading = signal(true);
  totalRecords = signal(0);

  pendingCount = computed(() => this.readings().filter(r => r.status === 'PENDING').length);
  inProgressCount = computed(() => this.readings().filter(r => r.status === 'IN_PROGRESS').length);
  publishedCount = computed(() => this.readings().filter(r => r.status === 'PUBLISHED').length);

  searchTerm = '';
  selectedStatus: string | null = null;

  get statusOptions() {
    return [
      { label: this.translate.instant('admin.readings.allStatus'), value: null },
      { label: this.translate.instant('admin.readings.statusWaiting'), value: 'PENDING' },
      { label: this.translate.instant('admin.readings.statusInProgress'), value: 'IN_PROGRESS' },
      { label: this.translate.instant('admin.readings.statusPublished'), value: 'PUBLISHED' },
    ];
  }

  ngOnInit(): void {
    this.loadReadings();
  }

  loadReadings(event?: any): void {
    this.loading.set(true);
    const params: any = {
      page: event?.first ? Math.floor(event.first / (event.rows || 10)) + 1 : 1,
      limit: event?.rows || 10,
    };

    if (this.searchTerm) params.search = this.searchTerm;
    if (this.selectedStatus) params.status = this.selectedStatus;

    this.readingsService.findAll(params).subscribe({
      next: (response) => {
        this.readings.set(response.data);
        this.totalRecords.set(response.meta.total);
        this.loading.set(false);
      },
      error: () => {
        this.readings.set([]);
        this.loading.set(false);
      },
    });
  }

  onSearch(): void {
    this.loadReadings();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: this.translate.instant('admin.readings.statusWaiting'),
      IN_PROGRESS: this.translate.instant('admin.readings.statusInProgress'),
      PUBLISHED: this.translate.instant('admin.readings.statusPublished'),
      ARCHIVED: 'Arquivada',
    };
    return labels[status] || status;
  }

  getStatusTone(status: string): DeliveryTone {
    const tones: Record<string, DeliveryTone> = {
      PENDING: 'warning',
      IN_PROGRESS: 'brand',
      PUBLISHED: 'success',
      ARCHIVED: 'neutral',
    };
    return tones[status] || 'neutral';
  }

  formatDate(dateString: string | Date): string {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getTimeSinceCreation(dateString: string | Date): string {
    const created = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return this.translate.instant('admin.readings.daysAgo', { count: diffDays });
    }
    return this.translate.instant('admin.readings.hoursAgo', { count: diffHours });
  }

  getDeliveryTypeLabel(reading: Reading): string {
    if (reading.deliveryType) return reading.deliveryType;
    return 'CONTENT';
  }
}
