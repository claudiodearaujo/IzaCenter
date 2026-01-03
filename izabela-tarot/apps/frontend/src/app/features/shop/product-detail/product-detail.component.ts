// apps/frontend/src/app/features/shop/product-detail/product-detail.component.ts

import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { Textarea, TextareaModule } from 'primeng/textarea';
import { Tabs, TabsModule } from 'primeng/tabs';
import { SkeletonModule } from 'primeng/skeleton';
import { GalleriaModule } from 'primeng/galleria';

import { ApiService } from '../../../core/services/api.service';
import { CartService } from '../../../core/services/cart.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Product } from '../../../core/models/product.model';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl.pipe';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ButtonModule,
    TextareaModule,
    TabsModule,
    SkeletonModule,
    GalleriaModule,
    CurrencyBrlPipe,
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
})
export class ProductDetailComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cartService = inject(CartService);
  private notification = inject(NotificationService);

  product = signal<Product | null>(null);
  loading = signal(true);
  relatedProducts = signal<Product[]>([]);
  
  question = signal('');
  addingToCart = signal(false);

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params['slug']) {
        this.loadProduct(params['slug']);
      }
    });
  }

  loadProduct(slug: string) {
    this.loading.set(true);
    
    this.api.get<Product>(`/products/public/${slug}`).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loading.set(false);
        this.loadRelatedProducts(product.categoryId);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error('Produto não encontrado');
        this.router.navigate(['/loja']);
      },
    });
  }

  loadRelatedProducts(categoryId: string | undefined) {
    if (!categoryId) return;

    this.api.get<{ data: Product[] }>('/products/public', {
      categoryId,
      limit: 4,
    }).subscribe({
      next: (response) => {
        const filtered = response.data.filter(p => p.id !== this.product()?.id);
        this.relatedProducts.set(filtered.slice(0, 3));
      },
    });
  }

  addToCart() {
    const prod = this.product();
    if (!prod) return;

    this.addingToCart.set(true);

    this.cartService.addItem({
      productId: prod.id,
      productName: prod.name,
      productSlug: prod.slug,
      productType: prod.productType,
      price: prod.price,
      originalPrice: prod.originalPrice,
      coverImageUrl: prod.coverImageUrl,
      quantity: 1,
      questions: this.question() ? [this.question()] : [],
    });

    this.notification.success('Produto adicionado ao carrinho!');
    this.addingToCart.set(false);
  }

  buyNow() {
    this.addToCart();
    this.router.navigate(['/loja/carrinho']);
  }

  getDiscountPercentage(): number {
    const prod = this.product();
    if (!prod || !prod.originalPrice) return 0;
    return Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100);
  }

  getProductTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'QUESTION': 'Perguntas',
      'SESSION': 'Sessão Completa',
      'MONTHLY': 'Mensal',
      'SPECIAL': 'Especial',
    };
    return labels[type] || type;
  }
}
