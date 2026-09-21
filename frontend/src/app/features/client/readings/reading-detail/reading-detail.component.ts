import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';

import { Delivery } from '../../../../core/models/delivery.model';
import { ReadingsService } from '../../../../core/services/readings.service';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-reading-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    SkeletonModule,
    DividerModule,
  ],
  templateUrl: './reading-detail.component.html',
  styleUrl: './reading-detail.component.css',
})
export class ReadingDetailComponent implements OnInit {
  private deliveriesService = inject(ReadingsService);
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  reading = signal<Delivery | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  audioPlaying = signal(false);
  downloadingPdf = signal(false);

  ngOnInit() {
    const deliveryId = this.route.snapshot.paramMap.get('id');
    if (deliveryId) {
      this.loadDelivery(deliveryId);
    }
  }

  loadDelivery(id: string) {
    this.loading.set(true);

    this.deliveriesService.getMyReadingById(id).subscribe({
      next: (response) => {
        if (response.data.status !== 'PUBLISHED') {
          this.router.navigate(['/cliente/entregas']);
          return;
        }
        this.reading.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erro ao carregar entrega');
        this.loading.set(false);
      },
    });
  }

  hasCardModule(): boolean {
    return this.reading()?.specialtyModule?.key === 'tarot-cards';
  }

  downloadPdf(): void {
    const deliveryId = this.reading()?.id;
    if (!deliveryId) return;

    this.downloadingPdf.set(true);

    this.api.getBlob(`/deliveries/${deliveryId}/pdf`).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        const title = this.reading()?.title || 'entrega';
        anchor.download = `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`;
        anchor.click();
        URL.revokeObjectURL(url);
        this.downloadingPdf.set(false);
      },
      error: () => {
        this.downloadingPdf.set(false);
        window.print();
      },
    });
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }
}
