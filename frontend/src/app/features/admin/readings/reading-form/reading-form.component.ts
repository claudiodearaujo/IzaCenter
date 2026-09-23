import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';

import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { EditorModule } from 'primeng/editor';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule, FileUploadHandlerEvent } from 'primeng/fileupload';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ReadingsService, Reading, ReadingCard, UpdateReadingDTO } from '../../../../core/services/readings.service';
import { CardsService, CiganoCard } from '../../../../core/services/cards.service';
import { NotificationService } from '../../../../core/services/notification.service';
import {
  DsAvatarComponent,
  DsBadgeComponent,
  DsButtonComponent,
  DsCardComponent,
  DsEmptyStateComponent,
  DsFormFieldComponent,
} from '../../../../shared/design-system';

type DeliveryFormModel = UpdateReadingDTO & {
  content: {
    introduction?: string;
    body?: string;
    recommendations?: string;
    goals?: string;
    closing?: string;
  };
};

type DeliveryTone = 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info';

@Component({
  selector: 'app-reading-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    InputTextModule,
    TextareaModule,
    EditorModule,
    DialogModule,
    FileUploadModule,
    TranslateModule,
    DsAvatarComponent,
    DsBadgeComponent,
    DsButtonComponent,
    DsCardComponent,
    DsEmptyStateComponent,
    DsFormFieldComponent,
  ],
  templateUrl: './reading-form.component.html',
  styleUrl: './reading-form.component.css',
})
export class ReadingFormComponent implements OnInit {
  private readingsService = inject(ReadingsService);
  private cardsService = inject(CardsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notification = inject(NotificationService);
  private translate = inject(TranslateService);

  readingId = signal<string | null>(null);
  reading = signal<Reading | null>(null);
  loading = signal(true);
  saving = signal(false);
  publishing = signal(false);

  availableCards = signal<CiganoCard[]>([]);
  selectedCards = signal<ReadingCard[]>([]);
  cardDialogVisible = signal(false);
  editingCardIndex = signal<number | null>(null);

  form: DeliveryFormModel = {
    title: '',
    content: {
      introduction: '',
      body: '',
      recommendations: '',
      goals: '',
      closing: '',
    },
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.readingId.set(id);
      this.loadReading(id);
    }
  }

  loadReading(id: string): void {
    this.loading.set(true);

    this.readingsService.findById(id).subscribe({
      next: (response) => {
        const reading = response.data;
        this.reading.set(reading);

        this.form = {
          title: reading.title || '',
          deliveryType: reading.deliveryType,
          specialtyModule: reading.specialtyModule,
          metadata: reading.metadata,
          content: {
            introduction: reading.content?.introduction || reading.introduction || '',
            body: reading.content?.body || reading.interpretation || reading.generalGuidance || '',
            recommendations: reading.content?.recommendations || reading.advice || reading.recommendations || '',
            goals: reading.content?.goals || reading.goals || '',
            closing: reading.content?.closing || reading.conclusion || reading.closingMessage || '',
          },
        };

        this.selectedCards.set(reading.cards || []);

        if (this.hasCardModule()) {
          this.loadCards();
        }

        if (reading.status === 'PENDING') {
          this.startReading();
        }

        this.loading.set(false);
      },
      error: () => {
        this.notification.error(this.translate.instant('admin.readings.errorLoading'));
        this.router.navigate(['/admin/entregas']);
      },
    });
  }

  loadCards(): void {
    this.cardsService.findAll().subscribe({
      next: (response) => {
        this.availableCards.set(response.data);
      },
    });
  }

  startReading(): void {
    this.readingsService.updateStatus(this.readingId()!, 'IN_PROGRESS').subscribe({
      next: () => {
        this.reading.update((r) => (r ? { ...r, status: 'IN_PROGRESS' } : null));
      },
    });
  }

  saveReading(): void {
    this.saving.set(true);

    const data: UpdateReadingDTO = {
      ...this.form,
      cards: this.hasCardModule()
        ? this.selectedCards().map((c) => ({
            cardId: c.cardId,
            position: c.position,
            positionName: c.positionName,
            interpretation: c.interpretation,
          }))
        : undefined,
    };

    this.readingsService.update(this.readingId()!, data).subscribe({
      next: () => {
        this.notification.success(this.translate.instant('admin.readings.savedSuccess'));
        this.saving.set(false);
      },
      error: () => {
        this.notification.error(this.translate.instant('admin.readings.errorSaving'));
        this.saving.set(false);
      },
    });
  }

  publishReading(): void {
    if (!this.form.content.body) {
      this.notification.warning(this.translate.instant('admin.readings.interpretationRequired'));
      return;
    }

    this.publishing.set(true);

    const data: UpdateReadingDTO = {
      ...this.form,
      cards: this.hasCardModule()
        ? this.selectedCards().map((c) => ({
            cardId: c.cardId,
            position: c.position,
            positionName: c.positionName,
            interpretation: c.interpretation,
          }))
        : undefined,
    };

    this.readingsService.update(this.readingId()!, data).subscribe({
      next: () => {
        this.readingsService.updateStatus(this.readingId()!, 'PUBLISHED').subscribe({
          next: () => {
            this.notification.success(this.translate.instant('admin.readings.publishedSuccess'));
            this.router.navigate(['/admin/entregas']);
          },
          error: () => {
            this.notification.error(this.translate.instant('admin.readings.errorPublishing'));
            this.publishing.set(false);
          },
        });
      },
      error: () => {
        this.notification.error(this.translate.instant('admin.readings.errorSaving'));
        this.publishing.set(false);
      },
    });
  }

  hasCardModule(): boolean {
    return this.reading()?.specialtyModule?.key === 'tarot-cards';
  }

  openCardDialog(index?: number): void {
    this.editingCardIndex.set(index ?? null);
    this.cardDialogVisible.set(true);
  }

  selectCard(card: CiganoCard): void {
    const newCard: ReadingCard = {
      cardId: card.id,
      card,
      position: this.selectedCards().length + 1,
      positionName: this.translate.instant('admin.readings.cardPosition', { number: this.selectedCards().length + 1 }),
      interpretation: '',
    };

    if (this.editingCardIndex() !== null) {
      const cards = [...this.selectedCards()];
      cards[this.editingCardIndex()!] = {
        ...cards[this.editingCardIndex()!],
        cardId: card.id,
        card,
      };
      this.selectedCards.set(cards);
    } else {
      this.selectedCards.update((cards) => [...cards, newCard]);
    }

    this.cardDialogVisible.set(false);
    this.editingCardIndex.set(null);
  }

  removeCard(index: number): void {
    this.selectedCards.update((cards) => cards.filter((_, i) => i !== index));
    this.selectedCards.update((cards) =>
      cards.map((c, i) => ({ ...c, position: i + 1 }))
    );
  }

  updateCardInterpretation(index: number, interpretation: string): void {
    this.selectedCards.update((cards) => {
      const updated = [...cards];
      updated[index] = { ...updated[index], interpretation };
      return updated;
    });
  }

  updateCardPositionName(index: number, positionName: string): void {
    this.selectedCards.update((cards) => {
      const updated = [...cards];
      updated[index] = { ...updated[index], positionName };
      return updated;
    });
  }

  onAudioUpload(event: FileUploadHandlerEvent): void {
    if (event.files?.length) {
      const file = event.files[0];
      this.readingsService.uploadAudio(this.readingId()!, file).subscribe({
        next: (response) => {
          this.reading.update((r) =>
            r ? { ...r, audioUrl: response.data.audioUrl } : null
          );
          this.notification.success(this.translate.instant('admin.readings.audioUploadedSuccess'));
        },
        error: () => {
          this.notification.error(this.translate.instant('admin.readings.errorUploadingAudio'));
        },
      });
    }
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: this.translate.instant('admin.readings.statusPending'),
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
}
