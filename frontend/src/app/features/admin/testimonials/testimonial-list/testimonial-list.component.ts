// apps/frontend/src/app/features/admin/testimonials/testimonial-list/testimonial-list.component.ts

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { InputTextModule } from 'primeng/inputtext';
import { Select, SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { RatingModule } from 'primeng/rating';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
    SkeletonModule,
    DialogModule,
    RatingModule,
    ConfirmDialogModule,
    CheckboxModule,
    TooltipModule,
    TranslateModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './testimonial-list.component.html',
  styleUrl: './testimonial-list.component.css',
})
export class TestimonialListComponent implements OnInit {
  private testimonialsService = inject(TestimonialsService);
  private notification = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);
  private translate = inject(TranslateService);

  testimonials = signal<Testimonial[]>([]);
  loading = signal(true);
  totalRecords = signal(0);

  // Computed signals for counts
  pendingCount = computed(() => this.testimonials().filter(t => !t.isApproved).length);
  approvedCount = computed(() => this.testimonials().filter(t => t.isApproved).length);
  featuredCount = computed(() => this.testimonials().filter(t => t.isFeatured).length);

  selectedFilter: string | null = null;
  searchTerm = '';
  selectedStatus: string | null = null;

  get statusOptions() {
    return [
      { label: this.translate.instant('common.all'), value: null },
      { label: this.translate.instant('admin.testimonials.statusPending'), value: 'pending' },
      { label: this.translate.instant('admin.testimonials.statusApproved'), value: 'approved' },
      { label: this.translate.instant('admin.testimonials.statusFeatured'), value: 'featured' },
    ];
  }

  get filterOptions() {
    return [
      { label: this.translate.instant('common.all'), value: null },
      { label: this.translate.instant('admin.testimonials.statusPending'), value: 'pending' },
      { label: this.translate.instant('admin.testimonials.statusApproved'), value: 'approved' },
      { label: this.translate.instant('admin.testimonials.statusFeatured'), value: 'featured' },
    ];
  }

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
      return testimonial.isFeatured ? this.translate.instant('admin.testimonials.featured') : this.translate.instant('admin.testimonials.approved');
    }
    return this.translate.instant('admin.testimonials.pending');
  }

  getStatusSeverity(testimonial: Testimonial): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    if (testimonial.isApproved) {
      return testimonial.isFeatured ? 'info' : 'success';
    }
    return 'warn';
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  toggleHighlight(testimonial: Testimonial) {
    this.toggleFeatured(testimonial);
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
        this.notification.success(this.translate.instant('admin.testimonials.approvedSuccess'));
        this.loadTestimonials();
        this.viewDialogVisible.set(false);
      },
      error: () => {
        this.notification.error(this.translate.instant('admin.testimonials.errorApproving'));
      },
    });
  }

  rejectTestimonial(testimonial: Testimonial) {
    this.confirmationService.confirm({
      message: this.translate.instant('admin.testimonials.rejectConfirm'),
      header: this.translate.instant('admin.testimonials.confirmRejection'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate.instant('admin.testimonials.yesReject'),
      rejectLabel: this.translate.instant('common.cancel'),
      accept: () => {
        this.testimonialsService.update(testimonial.id, { isApproved: false }).subscribe({
          next: () => {
            this.notification.success(this.translate.instant('admin.testimonials.rejectedSuccess'));
            this.loadTestimonials();
            this.viewDialogVisible.set(false);
          },
          error: () => {
            this.notification.error(this.translate.instant('admin.testimonials.errorRejecting'));
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
              ? this.translate.instant('admin.testimonials.unfeaturedSuccess')
              : this.translate.instant('admin.testimonials.featuredSuccess')
          );
        },
        error: () => {
          this.notification.error(this.translate.instant('admin.testimonials.errorUpdating'));
        },
      });
  }

  confirmDelete(testimonial: Testimonial) {
    this.confirmationService.confirm({
      message: this.translate.instant('admin.testimonials.deleteConfirm'),
      header: this.translate.instant('admin.testimonials.confirmDeletion'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate.instant('admin.testimonials.yesDelete'),
      rejectLabel: this.translate.instant('common.cancel'),
      accept: () => {
        this.deleteTestimonial(testimonial.id);
      },
    });
  }

  deleteTestimonial(id: string) {
    this.testimonialsService.delete(id).subscribe({
      next: () => {
        this.notification.success(this.translate.instant('admin.testimonials.deletedSuccess'));
        this.loadTestimonials();
      },
      error: () => {
        this.notification.error(this.translate.instant('admin.testimonials.errorDeleting'));
      },
    });
  }

  getAverageRating(): number {
    const approved = this.testimonials().filter((t) => t.isApproved);
    if (approved.length === 0) return 0;
    const sum = approved.reduce((acc, t) => acc + (t.rating ?? 0), 0);
    return Math.round((sum / approved.length) * 10) / 10;
  }
}
