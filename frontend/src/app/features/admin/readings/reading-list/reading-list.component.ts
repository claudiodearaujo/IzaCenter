// apps/frontend/src/app/features/admin/readings/reading-list/reading-list.component.ts

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';

import { ReadingsService, Reading } from '../../../../core/services/readings.service';

@Component({
  selector: 'app-admin-reading-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    Select,
    TagModule,
    Tooltip,
  ],
  templateUrl: './reading-list.component.html',
  styleUrl: './reading-list.component.css',
})
export class AdminReadingListComponent implements OnInit {
  private readingsService = inject(ReadingsService);

  readings = signal<Reading[]>([]);
  loading = signal(true);
  totalRecords = signal(0);

  // Computed stats
  pendingCount = computed(() => this.readings().filter(r => r.status === 'PENDING').length);
  inProgressCount = computed(() => this.readings().filter(r => r.status === 'IN_PROGRESS').length);
  publishedCount = computed(() => this.readings().filter(r => r.status === 'PUBLISHED').length);

  searchTerm = '';
  selectedStatus: string | null = null;

  statusOptions = [
    { label: 'Todos', value: null },
    { label: 'Pendente', value: 'PENDING' },
    { label: 'Em Andamento', value: 'IN_PROGRESS' },
    { label: 'Publicada', value: 'PUBLISHED' },
  ];

  ngOnInit() {
    this.loadReadings();
  }

  loadReadings(event?: any) {
    this.loading.set(true);

    const params: any = {
      page: event?.first ? Math.floor(event.first / (event.rows || 10)) + 1 : 1,
      limit: event?.rows || 10,
    };

    if (this.searchTerm) {
      params.search = this.searchTerm;
    }

    if (this.selectedStatus) {
      params.status = this.selectedStatus;
    }

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

  onSearch() {
    this.loadReadings();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'Pendente',
      IN_PROGRESS: 'Em andamento',
      PUBLISHED: 'Publicada',
    };
    return labels[status] || status;
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severities: Record<string, 'success' | 'info' | 'warn' | 'danger'> = {
      PENDING: 'warn',
      IN_PROGRESS: 'info',
      PUBLISHED: 'success',
    };
    return severities[status] || 'info';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getTimeSinceCreation(dateString: string): string {
    const created = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} dia(s)`;
    }
    return `${diffHours} hora(s)`;
  }
}
