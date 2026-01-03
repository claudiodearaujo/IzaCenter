// apps/frontend/src/app/features/client/readings/reading-list/reading-list.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../../../core/services/api.service';

interface Reading {
  id: string;
  title?: string;
  status: string;
  publishedAt?: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    type: string;
    coverImageUrl?: string;
  };
  orderItem: {
    questions: string[];
  };
}

@Component({
  selector: 'app-reading-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ButtonModule,
    SkeletonModule,
    SelectButtonModule,
  ],
  templateUrl: './reading-list.component.html',
  styleUrl: './reading-list.component.css',
})
export class ReadingListComponent implements OnInit {
  private api = inject(ApiService);

  readings = signal<Reading[]>([]);
  loading = signal(true);
  selectedFilter = signal('all');

  filterOptions = [
    { label: 'Todas', value: 'all' },
    { label: 'Aguardando', value: 'WAITING' },
    { label: 'Em Andamento', value: 'IN_PROGRESS' },
    { label: 'Publicadas', value: 'PUBLISHED' },
  ];

  ngOnInit() {
    this.loadReadings();
  }

  loadReadings() {
    this.loading.set(true);

    const params: any = {};
    if (this.selectedFilter() !== 'all') {
      params.status = this.selectedFilter();
    }

    this.api.get<{ data: Reading[] }>('/users/me/readings', params).subscribe({
      next: (response) => {
        this.readings.set(response.data);
        this.loading.set(false);
      },
      error: () => {
        this.readings.set([]);
        this.loading.set(false);
      },
    });
  }

  onFilterChange() {
    this.loadReadings();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      WAITING: 'Aguardando',
      IN_PROGRESS: 'Em andamento',
      PUBLISHED: 'Publicada',
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      WAITING: 'bg-yellow-500/20 text-yellow-400',
      IN_PROGRESS: 'bg-blue-500/20 text-blue-400',
      PUBLISHED: 'bg-green-500/20 text-green-400',
    };
    return classes[status] || 'bg-gray-500/20 text-gray-400';
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      WAITING: 'pi-clock',
      IN_PROGRESS: 'pi-spin pi-spinner',
      PUBLISHED: 'pi-check-circle',
    };
    return icons[status] || 'pi-circle';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }
}
