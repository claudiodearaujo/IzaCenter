// apps/frontend/src/app/features/admin/testimonials/testimonial-list/testimonial-list.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { Select, SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { RatingModule } from 'primeng/rating';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';

import { TestimonialsService, Testimonial } from '../../../../core/services/testimonials.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-testimonial-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    SelectModule,
    TagModule,
    DialogModule,
    RatingModule,
    ConfirmDialogModule,
    CheckboxModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './testimonial-list.component.html',
  styleUrl: './testimonial-list.component.css',
})
export class TestimonialListComponent implements OnInit {
  private testimonialsService = inject(TestimonialsService);
  private notification = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);

  testimonials = signal<Testimonial[]>([]);
  loading = signal(true);
  totalRecords = signal(0);

  selectedFilter: string | null = null;
  searchTerm = '';

  filterOptions = [
    { label: 'Todos', value: null },
    { label: 'Pendentes', value: 'pending' },
    { label: 'Aprovados', value: 'approved' },
    { label: 'Destacados', value: 'featured' },
  ];

  // View Dialog
  viewDialogVisible = signal(false);
  selectedTestimonial = signal<Testimonial | null>(null);

  ngOnInit() {
    this.loadTestimonials();
  }

  loadTestimonials(event?: any) {
    this.loading.set(true);

    const params: any = {
      page: event?.first ? Math.floor(event.first / (event.rows || 10)) + 1 : 1,
      limit: event?.rows || 10,
    };

    if (this.selectedFilter === 'pending') {
      params.isApproved = false;
    } else if (this.selectedFilter === 'approved') {
      params.isApproved = true;
    } else if (this.selectedFilter === 'featured') {
      params.isFeatured = true;
    }

    if (this.searchTerm) {
      params.search = this.searchTerm;
    }

    this.testimonialsService.findAll(params).subscribe({
      next: (response) => {
        this.testimonials.set(response.data);
        this.totalRecords.set(response.meta.total);
        this.loading.set(false);
      },
      error: () => {
        this.testimonials.set([]);
        this.loading.set(false);
      },
    });
  }

  onSearch() {
    this.loadTestimonials();
  }

  getStatusLabel(testimonial: Testimonial): string {
    if (testimonial.isApproved) {
      return testimonial.isFeatured ? 'Destaque' : 'Aprovado';
    }
    return 'Pendente';
  }

  getStatusSeverity(testimonial: Testimonial): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    if (testimonial.isApproved) {
      return testimonial.isFeatured ? 'info' : 'success';
    }
    return 'warn';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  truncateContent(content: string, length = 100): string {
    if (content.length <= length) return content;
    return content.substring(0, length) + '...';
  }

  viewTestimonial(testimonial: Testimonial) {
    this.selectedTestimonial.set(testimonial);
    this.viewDialogVisible.set(true);
  }

  approveTestimonial(testimonial: Testimonial) {
    this.testimonialsService.update(testimonial.id, { isApproved: true }).subscribe({
      next: () => {
        this.notification.success('Depoimento aprovado!');
        this.loadTestimonials();
        this.viewDialogVisible.set(false);
      },
      error: () => {
        this.notification.error('Erro ao aprovar');
      },
    });
  }

  rejectTestimonial(testimonial: Testimonial) {
    this.confirmationService.confirm({
      message: 'Deseja realmente rejeitar este depoimento?',
      header: 'Confirmar Rejeição',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, rejeitar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.testimonialsService.update(testimonial.id, { isApproved: false }).subscribe({
          next: () => {
            this.notification.success('Depoimento rejeitado');
            this.loadTestimonials();
            this.viewDialogVisible.set(false);
          },
          error: () => {
            this.notification.error('Erro ao rejeitar');
          },
        });
      },
    });
  }

  toggleFeatured(testimonial: Testimonial) {
    this.testimonialsService
      .update(testimonial.id, { isFeatured: !testimonial.isFeatured })
      .subscribe({
        next: () => {
          this.testimonials.update((items) =>
            items.map((t) =>
              t.id === testimonial.id ? { ...t, isFeatured: !t.isFeatured } : t
            )
          );
          this.notification.success(
            testimonial.isFeatured
              ? 'Depoimento removido dos destaques'
              : 'Depoimento destacado!'
          );
        },
        error: () => {
          this.notification.error('Erro ao atualizar');
        },
      });
  }

  confirmDelete(testimonial: Testimonial) {
    this.confirmationService.confirm({
      message: 'Deseja realmente excluir este depoimento? Esta ação não pode ser desfeita.',
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.deleteTestimonial(testimonial.id);
      },
    });
  }

  deleteTestimonial(id: string) {
    this.testimonialsService.delete(id).subscribe({
      next: () => {
        this.notification.success('Depoimento excluído!');
        this.loadTestimonials();
      },
      error: () => {
        this.notification.error('Erro ao excluir');
      },
    });
  }

  getAverageRating(): number {
    const approved = this.testimonials().filter((t) => t.isApproved);
    if (approved.length === 0) return 0;
    const sum = approved.reduce((acc, t) => acc + t.rating, 0);
    return Math.round((sum / approved.length) * 10) / 10;
  }
}
