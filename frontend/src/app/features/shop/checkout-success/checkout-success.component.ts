// apps/frontend/src/app/features/shop/checkout-success/checkout-success.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';

import { ApiService } from '../../../core/services/api.service';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl.pipe';

interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: { product: { name: string } }[];
}

@Component({
  selector: 'app-checkout-success',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslateModule,
    ButtonModule,
    SkeletonModule,
    CurrencyBrlPipe,
  ],
  templateUrl: './checkout-success.component.html',
  styleUrl: './checkout-success.component.css',
})
export class CheckoutSuccessComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  order = signal<OrderSummary | null>(null);
  loading = signal(true);
  error = signal(false);

  ngOnInit() {
    const orderId = this.route.snapshot.queryParamMap.get('orderId');
    if (orderId) {
      this.loadOrder(orderId);
    } else {
      this.loading.set(false);
    }
  }

  loadOrder(id: string) {
    this.api.get<{ data: OrderSummary }>(`/users/me/orders/${id}`).subscribe({
      next: (response) => {
        this.order.set(response.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
