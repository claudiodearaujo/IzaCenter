// apps/frontend/src/app/features/client/orders/order-detail/order-detail.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';

import { ApiService } from '../../../../core/services/api.service';
import { CurrencyBrlPipe } from '../../../../shared/pipes/currency-brl.pipe';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  questions: string[];
  product: {
    id: string;
    name: string;
    type: string;
    coverImageUrl?: string;
  };
  reading?: {
    id: string;
    status: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod?: string;
  subtotal: number;
  discount: number;
  total: number;
  notes?: string;
  paidAt?: string;
  createdAt: string;
  items: OrderItem[];
  user: {
    fullName: string;
    email: string;
  };
}

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    SkeletonModule,
    CurrencyBrlPipe,
  ],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css',
})
export class OrderDetailComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  order = signal<Order | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrder(orderId);
    }
  }

  loadOrder(id: string) {
    this.loading.set(true);

    this.api.get<{ data: Order }>(`/users/me/orders/${id}`).subscribe({
      next: (response) => {
        this.order.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erro ao carregar pedido');
        this.loading.set(false);
      },
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'Pendente',
      PAID: 'Pago',
      PROCESSING: 'Processando',
      COMPLETED: 'Concluído',
      CANCELLED: 'Cancelado',
      REFUNDED: 'Reembolsado',
      WAITING: 'Aguardando',
      IN_PROGRESS: 'Em andamento',
      PUBLISHED: 'Publicada',
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      WAITING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      PAID: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      PROCESSING: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
      IN_PROGRESS: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
      COMPLETED: 'bg-green-500/20 text-green-400 border-green-500/50',
      PUBLISHED: 'bg-green-500/20 text-green-400 border-green-500/50',
      CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/50',
      REFUNDED: 'bg-red-500/20 text-red-400 border-red-500/50',
    };
    return classes[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/50';
  }

  getPaymentLabel(method?: string): string {
    const labels: Record<string, string> = {
      card: 'Cartão de Crédito',
      pix: 'PIX',
      boleto: 'Boleto',
    };
    return method ? labels[method] || method : 'Não informado';
  }

  getProductTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      QUESTION: 'Perguntas',
      SESSION: 'Sessão',
      MONTHLY: 'Mensal',
      SPECIAL: 'Especial',
    };
    return labels[type] || type;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
