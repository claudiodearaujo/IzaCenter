// apps/frontend/src/app/features/shop/product-list/product-list.component.ts

import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {  ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Select } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SkeletonModule } from 'primeng/skeleton';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { ApiService } from '../../../core/services/api.service';
import { Product, ProductCategory, ProductType } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Select,
    InputTextModule,
    InputNumberModule,
    SkeletonModule,
    ProductCardComponent,
    TranslateModule,
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
export class ProductListComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);

  products = signal<Product[]>([]);
  categories = signal<ProductCategory[]>([]);
  loading = signal(true);

  selectedCategory = signal<string | null>(null);
  selectedType = signal<ProductType | null>(null);
  minPrice = signal<number | null>(null);
  maxPrice = signal<number | null>(null);
  searchTerm = signal('');
  sortOption = signal('newest');

  get sortOptions() {
    return [
      { label: this.translate.instant('shop.productList.sortNewest'), value: 'newest' },
      { label: this.translate.instant('shop.productList.sortPriceLow'), value: 'price_asc' },
      { label: this.translate.instant('shop.productList.sortPriceHigh'), value: 'price_desc' },
      { label: this.translate.instant('shop.productList.sortNameAZ'), value: 'name_asc' },
    ];
  }

  get typeOptions() {
    return [
      { label: this.translate.instant('shop.productList.allTypes'), value: null },
      { label: this.translate.instant('shop.productList.typeQuestion'), value: 'QUESTION' },
      { label: this.translate.instant('shop.productList.typeSession'), value: 'SESSION' },
      { label: this.translate.instant('shop.productList.typeMonthly'), value: 'MONTHLY' },
      { label: this.translate.instant('shop.productList.typeSpecial'), value: 'SPECIAL' },
    ];
  }

  ngOnInit() {
    this.loadCategories();
    
    this.route.queryParams.subscribe((params) => {
      if (params['categoria']) {
        this.selectedCategory.set(params['categoria']);
      }
      if (params['search']) {
        this.searchTerm.set(params['search']);
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

    if (this.selectedType()) {
      params.productType = this.selectedType();
    }

    if (this.minPrice() !== null && this.minPrice()! >= 0) {
      params.minPrice = this.minPrice();
    }

    if (this.maxPrice() !== null && this.maxPrice()! > 0) {
      params.maxPrice = this.maxPrice();
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

  onTypeChange(productType: ProductType | null) {
    this.selectedType.set(productType);
    this.loadProducts();
  }

  onPriceFilter() {
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
