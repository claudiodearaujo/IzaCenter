// apps/frontend/src/app/features/admin/cards/card-list/card-list.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { Textarea } from 'primeng/textarea';
import { FileUploadModule, FileUploadHandlerEvent } from 'primeng/fileupload';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { Checkbox } from 'primeng/checkbox';

import { CardsService, CiganoCard, CreateCardDTO } from '../../../../core/services/cards.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    DialogModule,
    Textarea,
    FileUploadModule,
    ConfirmDialogModule,
    Checkbox,
  ],
  providers: [ConfirmationService],
  templateUrl: './card-list.component.html',
  styleUrl: './card-list.component.css',
})
export class CardListComponent implements OnInit {
  private cardsService = inject(CardsService);
  private notification = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);

  cards = signal<CiganoCard[]>([]);
  loading = signal(true);
  searchTerm = '';

  // Dialog state
  dialogVisible = signal(false);
  editingCard = signal<CiganoCard | null>(null);
  saving = signal(false);

  // Form
  form: CreateCardDTO = {
    number: 1,
    name: '',
    isPositive: true,
    generalMeaning: '',
    loveMeaning: '',
    workMeaning: '',
    healthMeaning: '',
    moneyMeaning: '',
  };

  selectedImage: File | null = null;
  imagePreview = signal<string | null>(null);

  ngOnInit() {
    this.loadCards();
  }

  loadCards() {
    this.loading.set(true);

    this.cardsService.findAll().subscribe({
      next: (response) => {
        // Sort by number
        const sorted = response.data.sort((a, b) => a.number - b.number);
        this.cards.set(sorted);
        this.loading.set(false);
      },
      error: () => {
        this.cards.set([]);
        this.loading.set(false);
      },
    });
  }

  get filteredCards() {
    if (!this.searchTerm) {
      return this.cards();
    }
    const term = this.searchTerm.toLowerCase();
    return this.cards().filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.number.toString().includes(term) ||
        c.generalMeaning?.toLowerCase().includes(term)
    );
  }

  openDialog(card?: CiganoCard) {
    if (card) {
      this.editingCard.set(card);
      this.form = {
        number: card.number,
        name: card.name,
        isPositive: card.isPositive,
        generalMeaning: card.generalMeaning || '',
        loveMeaning: card.loveMeaning || '',
        workMeaning: card.workMeaning || '',
        healthMeaning: card.healthMeaning || '',
        moneyMeaning: card.moneyMeaning || '',
        imageUrl: card.imageUrl,
      };
      if (card.imageUrl) {
        this.imagePreview.set(card.imageUrl);
      }
    } else {
      this.editingCard.set(null);
      this.form = {
        number: this.cards().length + 1,
        name: '',
        isPositive: true,
        generalMeaning: '',
        loveMeaning: '',
        workMeaning: '',
        healthMeaning: '',
        moneyMeaning: '',
      };
      this.imagePreview.set(null);
    }
    this.selectedImage = null;
    this.dialogVisible.set(true);
  }

  closeDialog() {
    this.dialogVisible.set(false);
    this.editingCard.set(null);
    this.selectedImage = null;
    this.imagePreview.set(null);
  }

  onImageSelect(event: any) {
    const file = event.files?.[0];
    if (file) {
      this.selectedImage = file;
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  saveCard() {
    if (!this.form.name.trim()) {
      this.notification.warning('Informe o nome da carta');
      return;
    }

    this.saving.set(true);

    const request = this.editingCard()
      ? this.cardsService.update(this.editingCard()!.id, this.form)
      : this.cardsService.create(this.form);

    request.subscribe({
      next: () => {
        this.notification.success(
          this.editingCard() ? 'Carta atualizada!' : 'Carta criada!'
        );
        this.closeDialog();
        this.loadCards();
        this.saving.set(false);
      },
      error: () => {
        this.notification.error('Erro ao salvar carta');
        this.saving.set(false);
      },
    });
  }

  confirmDelete(card: CiganoCard) {
    this.confirmationService.confirm({
      message: `Deseja realmente excluir a carta "${card.name}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.deleteCard(card.id);
      },
    });
  }

  deleteCard(id: string) {
    this.cardsService.delete(id).subscribe({
      next: () => {
        this.notification.success('Carta excluída!');
        this.loadCards();
      },
      error: () => {
        this.notification.error('Erro ao excluir carta');
      },
    });
  }

  generateDeck() {
    this.confirmationService.confirm({
      message: 'Isso irá criar as 36 cartas do baralho Cigano com dados padrão. Cartas existentes não serão afetadas. Continuar?',
      header: 'Gerar Baralho Cigano',
      icon: 'pi pi-info-circle',
      acceptLabel: 'Sim, gerar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.loading.set(true);
        this.cardsService.generateDeck().subscribe({
          next: () => {
            this.notification.success('Baralho Cigano gerado!');
            this.loadCards();
          },
          error: () => {
            this.notification.error('Erro ao gerar baralho');
            this.loading.set(false);
          },
        });
      },
    });
  }
}
