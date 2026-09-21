// apps/frontend/src/app/features/admin/products/product-list/product-list.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmationService } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ProductsService, Product } from '../../../../core/services/products.service';
import { CategoriesService, ProductCategory } from '../../../../core/services/categories.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { CurrencyBrlPipe } from '../../../../shared/pipes/currency-brl.pipe';

@Component({
  selector: 'app-admin-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    Select,
    TagModule,
    Tooltip,
    ConfirmDialogModule,
    SkeletonModule,
    CurrencyBrlPipe,
    TranslateModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
export class AdminProductListComponent implements OnInit {
  private productsService = inject(ProductsService);
  private categoriesService = inject(CategoriesService);
  private notification = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);
  private translate = inject(TranslateService);

  products = signal<Product[]>([]);
  categories = signal<ProductCategory[]>([]);
  loading = signal(true);
  totalRecords = signal(0);

  searchTerm = '';
  selectedCategory: string | null = null;
  selectedKind: string | null = null;

  get serviceKindOptions() {
    return [
      { label: 'Todos os tipos', value: null },
      { label: 'Serviço', value: 'SERVICE' },
      { label: 'Sessão', value: 'SESSION' },
      { label: 'Pacote / acompanhamento', value: 'PACKAGE' },
      { label: 'Serviço assíncrono', value: 'ASYNC_SERVICE' },
      { label: 'Produto digital', value: 'DIGITAL_PRODUCT' },
    ];
  }

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories() {
    this.categoriesService.findAllAdmin().subscribe({
      next: (response) => {
        this.categories.set([
          { id: '', name: this.translate.instant('admin.products.allCategories'), slug: '', displayOrder: 0 } as ProductCategory,
          ...response.data,
        ]);
      },
    });
  }

  loadProducts(event?: any) {
    this.loading.set(true);

    const params: any = {
      page: event?.first ? Math.floor(event.first / (event.rows || 10)) + 1 : 1,
      limit: event?.rows || 10,
    };

    if (this.searchTerm) {
      params.search = this.searchTerm;
    }

    if (this.selectedCategory) {
      params.categoryId = this.selectedCategory;
    }

    if (this.selectedKind) {
      params.serviceKind = this.selectedKind;
    }

    this.productsService.findAllAdmin(params).subscribe({
      next: (response) => {
        this.products.set(response.data);
        this.totalRecords.set(response.meta.total);
        this.loading.set(false);
      },
      error: () => {
        this.products.set([]);
        this.loading.set(false);
      },
    });
  }

  onSearch() {
    this.loadProducts();
  }

  toggleActive(product: Product) {
    this.productsService
      .update(product.id, { isActive: !product.isActive })
      .subscribe({
        next: () => {
          this.notification.success(
            this.translate.instant('admin.products.saveSuccess')
          );
          this.loadProducts();
        },
        error: () => {
          this.notification.error(this.translate.instant('admin.products.saveError'));
        },
      });
  }

  toggleFeatured(product: Product) {
    this.productsService
      .update(product.id, { isFeatured: !product.isFeatured })
      .subscribe({
        next: () => {
          this.notification.success(
            this.translate.instant('admin.products.saveSuccess')
          );
          this.loadProducts();
        },
        error: () => {
          this.notification.error(this.translate.instant('admin.products.saveError'));
        },
      });
  }

  deleteProduct(product: Product) {
    this.confirmationService.confirm({
      message: this.translate.instant('admin.products.confirmDelete'),
      header: this.translate.instant('admin.products.deleteProduct'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate.instant('common.delete'),
      rejectLabel: this.translate.instant('common.cancel'),
      accept: () => {
        this.productsService.delete(product.id).subscribe({
          next: () => {
            this.notification.success(this.translate.instant('admin.products.deleteSuccess'));
            this.loadProducts();
          },
          error: (err) => {
            this.notification.error(
              err.error?.message || this.translate.instant('admin.products.deleteError')
            );
          },
        });
      },
    });
  }

  getServiceKindLabel(kind: string): string {
    const labels: Record<string, string> = {
      SERVICE: 'Serviço',
      SESSION: 'Sessão',
      PACKAGE: 'Pacote',
      ASYNC_SERVICE: 'Serviço assíncrono',
      DIGITAL_PRODUCT: 'Produto digital',
    };
    return labels[kind] || kind;
  }

  getServiceKindSeverity(kind: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severities: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      SERVICE: 'info',
      SESSION: 'success',
      PACKAGE: 'warn',
      ASYNC_SERVICE: 'secondary',
      DIGITAL_PRODUCT: 'danger',
    };
    return severities[kind] || 'info';
  }
}
