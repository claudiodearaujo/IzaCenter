import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { TextareaModule } from 'primeng/textarea';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { SkeletonModule } from 'primeng/skeleton';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
    TextareaModule,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    SkeletonModule,
    CurrencyBrlPipe,
    TranslateModule,
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
  private translate = inject(TranslateService);

  product = signal<Product | null>(null);
  loading = signal(true);
  relatedProducts = signal<Product[]>([]);

  question = signal('');
  addingToCart = signal(false);

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['slug']) {
        this.loadProduct(params['slug']);
      }
    });
  }

  loadProduct(slug: string): void {
    this.loading.set(true);

    this.api.get<Product>(`/products/public/${slug}`).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loading.set(false);
        this.loadRelatedProducts(product.categoryId);
      },
      error: () => {
        this.loading.set(false);
        this.notification.error(
          this.translate.instant('shop.productDetail.productNotFound')
        );
        this.router.navigate(['/loja']);
      },
    });
  }

  loadRelatedProducts(categoryId: string | undefined): void {
    if (!categoryId) return;

    this.api
      .get<{ data: Product[] }>('/products/public', {
        params: { categoryId, limit: 4 },
      })
      .subscribe({
        next: (response) => {
          const filtered = response.data.filter(
            (p) => p.id !== this.product()?.id
          );
          this.relatedProducts.set(filtered.slice(0, 3));
        },
      });
  }

  addToCart(): void {
    const prod = this.product();
    if (!prod) return;

    this.addingToCart.set(true);

    this.cartService.addItem(
      prod,
      1,
      this.question() ? [this.question()] : []
    );

    this.notification.success(
      this.translate.instant('shop.productDetail.productAdded')
    );
    this.addingToCart.set(false);
  }

  buyNow(): void {
    this.addToCart();
    this.router.navigate(['/carrinho']);
  }

  getDiscountPercentage(): number {
    const prod = this.product();
    if (!prod || !prod.originalPrice) return 0;
    return Math.round(
      ((prod.originalPrice - prod.price) / prod.originalPrice) * 100
    );
  }

  getServiceKindLabel(kind: string): string {
    const labels: Record<string, string> = {
      SERVICE: 'Serviço',
      SESSION: 'Sessão',
      PACKAGE: 'Pacote / acompanhamento',
      ASYNC_SERVICE: 'Serviço assíncrono',
      DIGITAL_PRODUCT: 'Produto digital',
    };
    return labels[kind] || kind;
  }

  getDeliveryFormatLabel(format?: string): string {
    const labels: Record<string, string> = {
      TEXT: 'Texto',
      PDF: 'PDF',
      AUDIO: 'Áudio',
      VIDEO: 'Vídeo',
      MIXED: 'Formato misto',
    };
    return format ? labels[format] || format : 'Digital';
  }
}
