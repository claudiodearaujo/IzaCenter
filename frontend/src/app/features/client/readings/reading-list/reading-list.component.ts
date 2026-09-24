import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SkeletonModule } from 'primeng/skeleton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';

import { Delivery } from '../../../../core/models/delivery.model';
import { ReadingsService } from '../../../../core/services/readings.service';
import {
  DsBadgeComponent,
  DsCardComponent,
  DsEmptyStateComponent,
  DsPageHeaderComponent,
} from '../../../../shared/design-system';

type DeliveryTone = 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info';

@Component({
  selector: 'app-reading-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    TranslateModule,
    SkeletonModule,
    SelectButtonModule,
    DsBadgeComponent,
    DsCardComponent,
    DsEmptyStateComponent,
    DsPageHeaderComponent,
  ],
  templateUrl: './reading-list.component.html',
  styleUrl: './reading-list.component.css',
})
export class ReadingListComponent implements OnInit {
  private deliveriesService = inject(ReadingsService);
  private translate = inject(TranslateService);

  readings = signal<Delivery[]>([]);
  loading = signal(true);
  selectedFilter = signal('all');

  filterOptions = [
    { label: this.translate.instant('client.readings.filterAll'), value: 'all' },
    { label: this.translate.instant('client.readings.filterWaiting'), value: 'PENDING' },
    { label: this.translate.instant('client.readings.filterInProgress'), value: 'IN_PROGRESS' },
    { label: this.translate.instant('client.readings.filterPublished'), value: 'PUBLISHED' },
  ];

  ngOnInit(): void {
    this.loadReadings();
  }

  loadReadings(): void {
    this.loading.set(true);

    this.deliveriesService.getMyReadings().subscribe({
      next: (response) => {
        const selected = this.selectedFilter();
        const deliveries = selected === 'all'
          ? response.data
          : response.data.filter((delivery) => delivery.status === selected);

        this.readings.set(deliveries);
        this.loading.set(false);
      },
      error: () => {
        this.readings.set([]);
        this.loading.set(false);
      },
    });
  }

  onFilterChange(): void {
    this.loadReadings();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: this.translate.instant('client.readings.statusWaiting'),
      IN_PROGRESS: this.translate.instant('client.readings.statusInProgress'),
      PUBLISHED: this.translate.instant('client.readings.statusPublished'),
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

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  getDeliveryTitle(reading: Delivery): string {
    return reading.title || reading.product?.name || reading.orderItem?.product?.name || 'Entrega';
  }

  getProductName(reading: Delivery): string {
    return reading.product?.name || reading.orderItem?.product?.name || '';
  }
}
