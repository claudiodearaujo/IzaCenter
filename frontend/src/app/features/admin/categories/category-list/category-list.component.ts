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
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
    TranslateModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css',
})
export class CategoryListComponent implements OnInit {
  private categoriesService = inject(CategoriesService);
  private notification = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);
  private translate = inject(TranslateService);

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
      this.notification.warning(this.translate.instant('admin.categories.nameRequired'));
      return;
    }

    this.saving.set(true);

    const request = this.editingCategory()
      ? this.categoriesService.update(this.editingCategory()!.id, this.form)
      : this.categoriesService.create(this.form);

    request.subscribe({
      next: () => {
        this.notification.success(
          this.editingCategory() ? this.translate.instant('admin.categories.updatedSuccess') : this.translate.instant('admin.categories.createdSuccess')
        );
        this.closeDialog();
        this.loadCategories();
        this.saving.set(false);
      },
      error: () => {
        this.notification.error(this.translate.instant('admin.categories.errorSaving'));
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
        this.notification.error(this.translate.instant('admin.categories.errorReordering'));
      },
    });
  }

  confirmDelete(category: ProductCategory) {
    if (category._count?.products && category._count.products > 0) {
      this.notification.warning(
        this.translate.instant('admin.categories.hasProducts', { count: category._count.products })
      );
      return;
    }

    this.confirmationService.confirm({
      message: this.translate.instant('admin.categories.deleteConfirm', { name: category.name }),
      header: this.translate.instant('admin.categories.confirmDeletion'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate.instant('admin.categories.yesDelete'),
      rejectLabel: this.translate.instant('common.cancel'),
      accept: () => {
        this.deleteCategory(category.id);
      },
    });
  }

  deleteCategory(id: string) {
    this.categoriesService.delete(id).subscribe({
      next: () => {
        this.notification.success(this.translate.instant('admin.categories.deletedSuccess'));
        this.loadCategories();
      },
      error: () => {
        this.notification.error(this.translate.instant('admin.categories.errorDeleting'));
      },
    });
  }

  toggleActive(category: ProductCategory) {
    this.categoriesService.update(category.id, { isActive: !category.isActive }).subscribe({
      next: () => {
        this.notification.success(
          category.isActive ? this.translate.instant('admin.categories.deactivatedSuccess') : this.translate.instant('admin.categories.activatedSuccess')
        );
        this.loadCategories();
      },
      error: () => {
        this.notification.error(this.translate.instant('admin.categories.errorUpdating'));
      },
    });
  }
}
