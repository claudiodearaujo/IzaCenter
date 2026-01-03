// apps/frontend/src/app/features/client/readings/reading-detail/reading-detail.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';

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

  reading = signal<Reading | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  audioPlaying = signal(false);

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

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  printReading() {
    window.print();
  }
}
