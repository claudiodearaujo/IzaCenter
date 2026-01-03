// apps/frontend/src/app/features/shop/product-list/product-list.component.ts

import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {  ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Select } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';

import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { ApiService } from '../../../core/services/api.service';
import { Product, ProductCategory } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    
    FormsModule,
    Select,
    InputTextModule,
    SkeletonModule,
    ProductCardComponent,
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
export class ProductListComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  products = signal<Product[]>([]);
  categories = signal<ProductCategory[]>([]);
  loading = signal(true);
  
  selectedCategory = signal<string | null>(null);
  searchTerm = signal('');
  sortOption = signal('newest');

  sortOptions = [
    { label: 'Mais recentes', value: 'newest' },
    { label: 'Menor preço', value: 'price_asc' },
    { label: 'Maior preço', value: 'price_desc' },
    { label: 'Nome A-Z', value: 'name_asc' },
  ];

  ngOnInit() {
    this.loadCategories();
    
    this.route.queryParams.subscribe((params) => {
      if (params['categoria']) {
        this.selectedCategory.set(params['categoria']);
      }
      this.loadProducts();
    });
  }

  loadCategories() {
    this.api.get<ProductCategory[]>('/products/categories/public').subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
    });
  }

  loadProducts() {
    this.loading.set(true);
    
    const params: any = {
      sortBy: this.getSortField(),
      sortOrder: this.getSortOrder(),
    };

    if (this.selectedCategory()) {
      params.categoryId = this.selectedCategory();
    }

    if (this.searchTerm()) {
      params.search = this.searchTerm();
    }

    this.api.get<{ data: Product[] }>('/products/public', params).subscribe({
      next: (response) => {
        this.products.set(response.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  onCategoryChange(categoryId: string | null) {
    this.selectedCategory.set(categoryId);
    this.loadProducts();
  }

  onSearch() {
    this.loadProducts();
  }

  onSortChange() {
    this.loadProducts();
  }

  private getSortField(): string {
    switch (this.sortOption()) {
      case 'price_asc':
      case 'price_desc':
        return 'price';
      case 'name_asc':
        return 'name';
      default:
        return 'createdAt';
    }
  }

  private getSortOrder(): 'asc' | 'desc' {
    switch (this.sortOption()) {
      case 'price_asc':
      case 'name_asc':
        return 'asc';
      default:
        return 'desc';
    }
  }
}
