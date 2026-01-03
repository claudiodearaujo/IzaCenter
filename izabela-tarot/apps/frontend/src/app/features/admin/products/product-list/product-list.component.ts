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
import { ConfirmationService } from 'primeng/api';

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
    CurrencyBrlPipe,
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

  products = signal<Product[]>([]);
  categories = signal<ProductCategory[]>([]);
  loading = signal(true);
  totalRecords = signal(0);

  searchTerm = '';
  selectedCategory: string | null = null;

  typeOptions = [
    { label: 'Todos', value: null },
    { label: 'Perguntas', value: 'QUESTION' },
    { label: 'Sessão', value: 'SESSION' },
    { label: 'Mensal', value: 'MONTHLY' },
    { label: 'Especial', value: 'SPECIAL' },
  ];

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories() {
    this.categoriesService.findAllAdmin().subscribe({
      next: (response) => {
        this.categories.set([
          { id: '', name: 'Todas', slug: '', displayOrder: 0 } as ProductCategory,
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
      params.category = this.selectedCategory;
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
            product.isActive ? 'Produto desativado' : 'Produto ativado'
          );
          this.loadProducts();
        },
        error: () => {
          this.notification.error('Erro ao atualizar produto');
        },
      });
  }

  toggleFeatured(product: Product) {
    this.productsService
      .update(product.id, { isFeatured: !product.isFeatured })
      .subscribe({
        next: () => {
          this.notification.success(
            product.isFeatured ? 'Removido dos destaques' : 'Adicionado aos destaques'
          );
          this.loadProducts();
        },
        error: () => {
          this.notification.error('Erro ao atualizar produto');
        },
      });
  }

  deleteProduct(product: Product) {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o produto "${product.name}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.productsService.delete(product.id).subscribe({
          next: () => {
            this.notification.success('Produto excluído');
            this.loadProducts();
          },
          error: (err) => {
            this.notification.error(
              err.error?.message || 'Erro ao excluir produto'
            );
          },
        });
      },
    });
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      QUESTION: 'Perguntas',
      SESSION: 'Sessão',
      MONTHLY: 'Mensal',
      SPECIAL: 'Especial',
    };
    return labels[type] || type;
  }

  getTypeSeverity(type: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severities: Record<string, 'success' | 'info' | 'warn' | 'danger'> = {
      QUESTION: 'info',
      SESSION: 'success',
      MONTHLY: 'warn',
      SPECIAL: 'danger',
    };
    return severities[type] || 'info';
  }
}
