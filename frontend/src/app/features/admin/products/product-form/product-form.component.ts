// apps/frontend/src/app/features/admin/products/product-form/product-form.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';

import { Select } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { FileUploadModule, FileUploadHandlerEvent } from 'primeng/fileupload';
import { EditorModule } from 'primeng/editor';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ProductsService, CreateProductDTO } from '../../../../core/services/products.service';
import { CategoriesService, ProductCategory } from '../../../../core/services/categories.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { TextareaModule } from 'primeng/textarea';

type ProductFormModel = CreateProductDTO & {
  serviceKind: string;
  capabilities: {
    scheduling: { enabled: boolean; durationMinutes?: number };
    intake: { enabled: boolean; maxQuestions?: number };
    digitalDelivery: { enabled: boolean; format?: 'TEXT' | 'PDF' | 'AUDIO' | 'VIDEO' | 'MIXED' };
    recurring: { enabled: boolean; sessions?: number; cadence?: string };
  };
};

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    Select,
    CheckboxModule,
    FileUploadModule,
    EditorModule,
    TranslateModule,
  ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css',
})
export class ProductFormComponent implements OnInit {
  private productsService = inject(ProductsService);
  private categoriesService = inject(CategoriesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notification = inject(NotificationService);
  private translate = inject(TranslateService);

  productId = signal<string | null>(null);
  isEditing = signal(false);
  loading = signal(false);
  saving = signal(false);
  coverImageUrl = signal<string | null>(null);

  categories = signal<ProductCategory[]>([]);

  form: ProductFormModel = {
    name: '',
    shortDescription: '',
    fullDescription: '',
    serviceKind: 'SERVICE',
    capabilities: {
      scheduling: { enabled: false },
      intake: { enabled: false },
      digitalDelivery: { enabled: false },
      recurring: { enabled: false },
    },
    price: 0,
    originalPrice: undefined,
    categoryId: '',
    isActive: true,
    isFeatured: false,
  };

  get serviceKindOptions() {
    return [
      { label: 'Serviço', value: 'SERVICE' },
      { label: 'Sessão', value: 'SESSION' },
      { label: 'Pacote / acompanhamento', value: 'PACKAGE' },
      { label: 'Serviço assíncrono', value: 'ASYNC_SERVICE' },
      { label: 'Produto digital', value: 'DIGITAL_PRODUCT' },
    ];
  }

  get deliveryFormatOptions() {
    return [
      { label: 'Texto', value: 'TEXT' },
      { label: 'PDF', value: 'PDF' },
      { label: 'Áudio', value: 'AUDIO' },
      { label: 'Vídeo', value: 'VIDEO' },
      { label: 'Misto', value: 'MIXED' },
    ];
  }

  ngOnInit() {
    this.loadCategories();

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'novo') {
      this.productId.set(id);
      this.isEditing.set(true);
      this.loadProduct(id);
    }
  }

  loadCategories() {
    this.categoriesService.findAllAdmin().subscribe({
      next: (response) => {
        this.categories.set(response.data);
      },
    });
  }

  loadProduct(id: string) {
    this.loading.set(true);

    this.productsService.findById(id).subscribe({
      next: (response) => {
        const product = response.data;
        this.form = {
          name: product.name,
          shortDescription: product.shortDescription || '',
          fullDescription: product.fullDescription || '',
          productType: product.productType,
          serviceKind: product.serviceKind || 'SERVICE',
          capabilities: {
            scheduling: product.capabilities?.scheduling || {
              enabled: product.requiresScheduling,
              durationMinutes: product.sessionDurationMinutes,
            },
            intake: product.capabilities?.intake || {
              enabled: !!product.numQuestions,
              maxQuestions: product.numQuestions,
            },
            digitalDelivery: product.capabilities?.digitalDelivery || { enabled: false },
            recurring: product.capabilities?.recurring || { enabled: false },
          },
          price: product.price,
          originalPrice: product.originalPrice,
          categoryId: product.categoryId || '',
          isActive: product.isActive,
          isFeatured: product.isFeatured,
        };
        this.coverImageUrl.set(product.coverImageUrl || null);
        this.loading.set(false);
      },
      error: () => {
        this.notification.error(this.translate.instant('messages.error.generic'));
        this.router.navigate(['/admin/produtos']);
      },
    });
  }

  save() {
    if (!this.form.name?.trim()) {
      this.notification.warning(this.translate.instant('validation.required'));
      return;
    }

    if (!this.form.price || this.form.price <= 0) {
      this.notification.warning(this.translate.instant('validation.required'));
      return;
    }

    this.saving.set(true);

    if (this.isEditing()) {
      this.productsService.update(this.productId()!, this.form).subscribe({
        next: () => {
          this.notification.success(this.translate.instant('admin.products.saveSuccess'));
          this.router.navigate(['/admin/produtos']);
        },
        error: (err) => {
          this.notification.error(err.error?.message || this.translate.instant('admin.products.saveError'));
          this.saving.set(false);
        },
      });
    } else {
      this.productsService.create(this.form).subscribe({
        next: () => {
          this.notification.success(this.translate.instant('admin.products.saveSuccess'));
          this.router.navigate(['/admin/produtos']);
        },
        error: (err) => {
          this.notification.error(err.error?.message || this.translate.instant('admin.products.saveError'));
          this.saving.set(false);
        },
      });
    }
  }

  onImageUpload(event: FileUploadHandlerEvent) {
    if (!this.productId()) {
      this.notification.warning(this.translate.instant('admin.products.saveSuccess'));
      return;
    }

    if (event.files && event.files.length > 0) {
      const file = event.files[0];
      this.productsService.uploadImage(file).subscribe({
        next: (response) => {
          this.coverImageUrl.set(response.url);
          this.form.coverImageUrl = response.url;
          this.notification.success(this.translate.instant('admin.products.saveSuccess'));
        },
        error: () => {
          this.notification.error(this.translate.instant('admin.products.saveError'));
        },
      });
    }
  }
}
