// apps/frontend/src/app/features/client/readings/reading-detail/reading-detail.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';

import { ApiService } from '../../../../core/services/api.service';

interface ReadingCard {
  id: string;
  position: number;
  positionName?: string;
  interpretation: string;
  card: {
    id: string;
    name: string;
    imageUrl?: string;
    keywords?: string[];
  };
}

interface Reading {
  id: string;
  title?: string;
  introduction?: string;
  generalInterpretation: string;
  advice?: string;
  conclusion?: string;
  audioUrl?: string;
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
  cards: ReadingCard[];
}

@Component({
  selector: 'app-reading-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslateModule,
    ButtonModule,
    SkeletonModule,
    DividerModule,
  ],
  templateUrl: './reading-detail.component.html',
  styleUrl: './reading-detail.component.css',
})
export class ReadingDetailComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private translate = inject(TranslateService);

  reading = signal<Reading | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  audioPlaying = signal(false);
  downloadingPdf = signal(false);

  ngOnInit() {
    const readingId = this.route.snapshot.paramMap.get('id');
    if (readingId) {
      this.loadReading(readingId);
    }
  }

  loadReading(id: string) {
    this.loading.set(true);

    this.api.get<{ data: Reading }>(`/users/me/readings/${id}`).subscribe({
      next: (response) => {
        // Redirect if not published
        if (response.data.status !== 'PUBLISHED') {
          this.router.navigate(['/cliente/leituras']);
          return;
        }
        this.reading.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erro ao carregar leitura');
        this.loading.set(false);
      },
    });
  }

  // Sprint 3.3b — Download PDF via blob (substituiu window.print())
  downloadPdf(): void {
    const readingId = this.reading()?.id;
    if (!readingId) return;

    this.downloadingPdf.set(true);

    this.api.getBlob(`/readings/${readingId}/pdf`).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        const title = this.reading()?.title || 'leitura';
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

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }
}
