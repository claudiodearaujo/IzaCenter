import { ProductType } from './product.model';

export type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productType: ProductType;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  clientQuestions: string[];
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  clientId: string;
  subtotal: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  clientNotes?: string;
  adminNotes?: string;
  paidAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}
