// apps/frontend/src/app/features/admin/categories/category-list/category-list.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea, TextareaModule } from 'primeng/textarea';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToggleButtonModule } from 'primeng/togglebutton';

import { CategoriesService, ProductCategory, CreateCategoryDTO } from '../../../../core/services/categories.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    TextareaModule,
    DialogModule,
    ConfirmDialogModule,
    ToggleButtonModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css',
})
export class CategoryListComponent implements OnInit {
  private categoriesService = inject(CategoriesService);
  private notification = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);

  categories = signal<ProductCategory[]>([]);
  loading = signal(true);

  // Dialog
  dialogVisible = signal(false);
  editingCategory = signal<ProductCategory | null>(null);
  saving = signal(false);

  form: CreateCategoryDTO = {
    name: '',
    description: '',
    displayOrder: 0,
    isActive: true,
  };

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading.set(true);

    this.categoriesService.findAllAdmin().subscribe({
      next: (response) => {
        this.categories.set(response.data.sort((a, b) => a.displayOrder - b.displayOrder));
        this.loading.set(false);
      },
      error: () => {
        this.categories.set([]);
        this.loading.set(false);
      },
    });
  }

  openDialog(category?: ProductCategory) {
    if (category) {
      this.editingCategory.set(category);
      this.form = {
        name: category.name,
        description: category.description || '',
        displayOrder: category.displayOrder,
        isActive: category.isActive,
      };
    } else {
      this.editingCategory.set(null);
      this.form = {
        name: '',
        description: '',
        displayOrder: this.categories().length,
        isActive: true,
      };
    }
    this.dialogVisible.set(true);
  }

  closeDialog() {
    this.dialogVisible.set(false);
    this.editingCategory.set(null);
  }

  saveCategory() {
    if (!this.form.name.trim()) {
      this.notification.warning('Informe o nome da categoria');
      return;
    }

    this.saving.set(true);

    const request = this.editingCategory()
      ? this.categoriesService.update(this.editingCategory()!.id, this.form)
      : this.categoriesService.create(this.form);

    request.subscribe({
      next: () => {
        this.notification.success(
          this.editingCategory() ? 'Categoria atualizada!' : 'Categoria criada!'
        );
        this.closeDialog();
        this.loadCategories();
        this.saving.set(false);
      },
      error: () => {
        this.notification.error('Erro ao salvar categoria');
        this.saving.set(false);
      },
    });
  }

  moveUp(category: ProductCategory) {
    const index = this.categories().findIndex((c) => c.id === category.id);
    if (index > 0) {
      this.reorderCategory(category.id, category.displayOrder - 1);
    }
  }

  moveDown(category: ProductCategory) {
    const index = this.categories().findIndex((c) => c.id === category.id);
    if (index < this.categories().length - 1) {
      this.reorderCategory(category.id, category.displayOrder + 1);
    }
  }

  reorderCategory(id: string, newOrder: number) {
    this.categoriesService.reorder(id, newOrder).subscribe({
      next: () => {
        this.loadCategories();
      },
      error: () => {
        this.notification.error('Erro ao reordenar');
      },
    });
  }

  confirmDelete(category: ProductCategory) {
    if (category._count?.products && category._count.products > 0) {
      this.notification.warning(
        `Esta categoria possui ${category._count.products} produto(s) vinculado(s). Remova-os primeiro.`
      );
      return;
    }

    this.confirmationService.confirm({
      message: `Deseja realmente excluir a categoria "${category.name}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.deleteCategory(category.id);
      },
    });
  }

  deleteCategory(id: string) {
    this.categoriesService.delete(id).subscribe({
      next: () => {
        this.notification.success('Categoria excluída!');
        this.loadCategories();
      },
      error: () => {
        this.notification.error('Erro ao excluir categoria');
      },
    });
  }

  toggleActive(category: ProductCategory) {
    this.categoriesService.update(category.id, { isActive: !category.isActive }).subscribe({
      next: () => {
        this.notification.success(
          category.isActive ? 'Categoria desativada!' : 'Categoria ativada!'
        );
        this.loadCategories();
      },
      error: () => {
        this.notification.error('Erro ao atualizar categoria');
      },
    });
  }
}
