// Compatibility component: UI is now Delivery-oriented while the file/class
// names remain Reading-based until the final rename cleanup.

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';

import { Delivery } from '../../../../core/models/delivery.model';
import { ReadingsService } from '../../../../core/services/readings.service';

@Component({
  selector: 'app-reading-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    TranslateModule,
    ButtonModule,
    SkeletonModule,
    SelectButtonModule,
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

  ngOnInit() {
    this.loadReadings();
  }

  loadReadings() {
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

  onFilterChange() {
    this.loadReadings();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: this.translate.instant('client.readings.statusWaiting'),
      IN_PROGRESS: this.translate.instant('client.readings.statusInProgress'),
      PUBLISHED: this.translate.instant('client.readings.statusPublished'),
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      PENDING: 'bg-yellow-500/20 text-yellow-400',
      IN_PROGRESS: 'bg-blue-500/20 text-blue-400',
      PUBLISHED: 'bg-green-500/20 text-green-400',
    };
    return classes[status] || 'bg-gray-500/20 text-gray-400';
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      PENDING: 'pi-clock',
      IN_PROGRESS: 'pi-spin pi-spinner',
      PUBLISHED: 'pi-check-circle',
    };
    return icons[status] || 'pi-circle';
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }
}
