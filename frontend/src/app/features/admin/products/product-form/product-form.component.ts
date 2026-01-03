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

import { ProductsService, CreateProductDTO } from '../../../../core/services/products.service';
import { CategoriesService, ProductCategory } from '../../../../core/services/categories.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { TextareaModule } from 'primeng/textarea';

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

  productId = signal<string | null>(null);
  isEditing = signal(false);
  loading = signal(false);
  saving = signal(false);
  coverImageUrl = signal<string | null>(null);

  categories = signal<ProductCategory[]>([]);

  form: CreateProductDTO = {
    name: '',
    shortDescription: '',
    fullDescription: '',
    productType: 'QUESTION',
    price: 0,
    originalPrice: undefined,
    numQuestions: 3,
    sessionDurationMinutes: undefined,
    categoryId: '',
    isActive: true,
    isFeatured: false,
  };

  typeOptions = [
    { label: 'Perguntas', value: 'QUESTION' },
    { label: 'Sessão ao Vivo', value: 'SESSION' },
    { label: 'Assinatura Mensal', value: 'MONTHLY' },
    { label: 'Especial', value: 'SPECIAL' },
  ];

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
          price: product.price,
          originalPrice: product.originalPrice,
          numQuestions: product.numQuestions,
          sessionDurationMinutes: product.sessionDurationMinutes,
          categoryId: product.categoryId || '',
          isActive: product.isActive,
          isFeatured: product.isFeatured,
        };
        this.coverImageUrl.set(product.coverImageUrl || null);
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('Erro ao carregar produto');
        this.router.navigate(['/admin/produtos']);
      },
    });
  }

  save() {
    if (!this.form.name?.trim()) {
      this.notification.warning('Nome é obrigatório');
      return;
    }

    if (!this.form.price || this.form.price <= 0) {
      this.notification.warning('Preço deve ser maior que zero');
      return;
    }

    this.saving.set(true);

    if (this.isEditing()) {
      this.productsService.update(this.productId()!, this.form).subscribe({
        next: () => {
          this.notification.success('Produto atualizado!');
          this.router.navigate(['/admin/produtos']);
        },
        error: (err) => {
          this.notification.error(err.error?.message || 'Erro ao atualizar');
          this.saving.set(false);
        },
      });
    } else {
      this.productsService.create(this.form).subscribe({
        next: () => {
          this.notification.success('Produto criado!');
          this.router.navigate(['/admin/produtos']);
        },
        error: (err) => {
          this.notification.error(err.error?.message || 'Erro ao criar');
          this.saving.set(false);
        },
      });
    }
  }

  onImageUpload(event: FileUploadHandlerEvent) {
    if (!this.productId()) {
      this.notification.warning('Salve o produto primeiro para adicionar imagem');
      return;
    }

    if (event.files && event.files.length > 0) {
      const file = event.files[0];
      this.productsService.uploadImage(file).subscribe({
        next: (response) => {
          this.coverImageUrl.set(response.url);
          this.form.coverImageUrl = response.url;
          this.notification.success('Imagem atualizada!');
        },
        error: () => {
          this.notification.error('Erro ao enviar imagem');
        },
      });
    }
  }
}
