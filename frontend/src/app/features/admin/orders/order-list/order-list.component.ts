// apps/frontend/src/app/features/admin/orders/order-list/order-list.component.ts

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { OrdersService, Order } from '../../../../core/services/orders.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-admin-order-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    Select,
    TagModule,
    SkeletonModule,
    DialogModule,
    ConfirmDialogModule,
    TooltipModule,
    TranslateModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css',
})
export class AdminOrderListComponent implements OnInit {
  private ordersService = inject(OrdersService);
  private notification = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);
  private translate = inject(TranslateService);

  orders = signal<Order[]>([]);
  loading = signal(true);
  totalRecords = signal(0);

  // Computed stats
  pendingCount = computed(() =>
    this.orders().filter(o => o.status === 'PENDING').length
  );
  paidCount = computed(() =>
    this.orders().filter(o => o.status === 'PAID').length
  );
  completedCount = computed(() =>
    this.orders().filter(o => o.status === 'COMPLETED').length
  );
  cancelledCount = computed(() =>
    this.orders().filter(o => o.status === 'CANCELLED').length
  );

  selectedStatus: string | null = null;
  searchTerm = '';

  get statusOptions() {
    return [
      { label: this.translate.instant('common.all'), value: null },
      { label: this.translate.instant('admin.orders.statusPending'), value: 'PENDING' },
      { label: this.translate.instant('admin.orders.statusPaid'), value: 'PAID' },
      { label: this.translate.instant('admin.orders.statusProcessing'), value: 'PROCESSING' },
      { label: this.translate.instant('admin.orders.statusCompleted'), value: 'COMPLETED' },
      { label: this.translate.instant('admin.orders.statusCancelled'), value: 'CANCELLED' },
      { label: this.translate.instant('admin.orders.statusRefunded'), value: 'REFUNDED' },
    ];
  }

  // Notes Dialog
  notesDialogVisible = signal(false);
  selectedOrder = signal<Order | null>(null);
  notes = '';
  saving = signal(false);

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders(event?: any) {
    this.loading.set(true);

    const params: any = {
      page: event?.first ? Math.floor(event.first / (event.rows || 10)) + 1 : 1,
      limit: event?.rows || 10,
    };

    if (this.selectedStatus) {
      params.status = this.selectedStatus;
    }

    if (this.searchTerm) {
      params.search = this.searchTerm;
    }

    this.ordersService.findAll(params).subscribe({
      next: (response) => {
        this.orders.set(response.data);
        this.totalRecords.set(response.meta.total);
        this.loading.set(false);
      },
      error: () => {
        this.orders.set([]);
        this.loading.set(false);
      },
    });
  }

  onSearch() {
    this.loadOrders();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: this.translate.instant('admin.orders.statusPending'),
      PAID: this.translate.instant('admin.orders.statusPaid'),
      PROCESSING: this.translate.instant('admin.orders.statusProcessing'),
      COMPLETED: this.translate.instant('admin.orders.statusCompleted'),
      CANCELLED: this.translate.instant('admin.orders.statusCancelled'),
      REFUNDED: this.translate.instant('admin.orders.statusRefunded'),
    };
    return labels[status] || status;
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severities: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      PENDING: 'warn',
      PAID: 'info',
      PROCESSING: 'info',
      COMPLETED: 'success',
      CANCELLED: 'danger',
      REFUNDED: 'secondary',
    };
    return severities[status] || 'info';
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  updateStatus(id: string, status: string, message: string) {
    this.ordersService.updateStatus(id, status).subscribe({
      next: () => {
        this.notification.success(message);
        this.loadOrders();
      },
      error: () => {
        this.notification.error(this.translate.instant('admin.orders.errorUpdatingStatus'));
      },
    });
  }

  openNotesDialog(order: Order) {
    this.selectedOrder.set(order);
    this.notes = order.adminNotes || '';
    this.notesDialogVisible.set(true);
  }

  saveNotes() {
    if (!this.selectedOrder()) return;

    this.saving.set(true);

    this.ordersService
      .updateAdminNotes(this.selectedOrder()!.id, this.notes)
      .subscribe({
        next: () => {
          this.notification.success(this.translate.instant('admin.orders.notesSaved'));
          this.notesDialogVisible.set(false);
          this.loadOrders();
          this.saving.set(false);
        },
        error: () => {
          this.notification.error(this.translate.instant('admin.orders.errorSaving'));
          this.saving.set(false);
        },
      });
  }

  cancelOrder(order: Order) {
    this.confirmationService.confirm({
      message: this.translate.instant('admin.orders.cancelConfirm'),
      header: this.translate.instant('admin.orders.confirmCancellation'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate.instant('admin.orders.yesCancel'),
      rejectLabel: this.translate.instant('common.no'),
      accept: () => {
        this.updateStatus(order.id, 'CANCELLED', this.translate.instant('admin.orders.cancelledSuccess'));
      },
    });
  }
}
