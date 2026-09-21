import { Injectable, inject, signal, computed } from '@angular/core';
import { StorageService } from './storage.service';
import { Product } from '../models/product.model';

export interface CartItem {
  product: Product;
  quantity: number;
  questions?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private storage = inject(StorageService);

  private itemsSignal = signal<CartItem[]>([]);

  readonly items = this.itemsSignal.asReadonly();
  readonly itemCount = computed(() => this.itemsSignal().reduce((acc, item) => acc + item.quantity, 0));
  readonly subtotal = computed(() => 
    this.itemsSignal().reduce((acc, item) => acc + (Number(item.product.price) * item.quantity), 0)
  );
  readonly total = computed(() => this.subtotal());

  constructor() {
    this.loadCart();
  }

  private loadCart(): void {
    const savedCart = this.storage.get<CartItem[]>('cart');
    if (savedCart) {
      this.itemsSignal.set(
        savedCart.map((item) => ({
          ...item,
          product: this.normalizeStoredProduct(item.product),
        }))
      );
    }
  }

  private normalizeStoredProduct(product: Product): Product {
    const legacyProduct = product as Product & {
      serviceKind?: Product['serviceKind'];
      capabilities?: Product['capabilities'];
    };

    const serviceKind = legacyProduct.serviceKind || this.serviceKindFromLegacy(product.productType);

    return {
      ...product,
      serviceKind,
      capabilities: legacyProduct.capabilities || {
        scheduling: {
          enabled: product.requiresScheduling || false,
          ...(product.sessionDurationMinutes ? { durationMinutes: product.sessionDurationMinutes } : {}),
        },
        intake: {
          enabled: product.numQuestions != null,
          ...(product.numQuestions ? { maxQuestions: product.numQuestions } : {}),
        },
      },
    };
  }

  private serviceKindFromLegacy(productType: Product['productType']): Product['serviceKind'] {
    switch (productType) {
      case 'SESSION': return 'SESSION';
      case 'MONTHLY': return 'PACKAGE';
      case 'QUESTION': return 'ASYNC_SERVICE';
      default: return 'SERVICE';
    }
  }

  private saveCart(): void {
    this.storage.set('cart', this.itemsSignal());
  }

  addItem(product: Product, quantity: number = 1, questions?: string[]): void {
    const currentItems = this.itemsSignal();
    const existingIndex = currentItems.findIndex(item => item.product.id === product.id);

    if (existingIndex > -1) {
      const updatedItems = [...currentItems];
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantity: updatedItems[existingIndex].quantity + quantity,
        questions: questions || updatedItems[existingIndex].questions
      };
      this.itemsSignal.set(updatedItems);
    } else {
      this.itemsSignal.set([...currentItems, { product, quantity, questions }]);
    }

    this.saveCart();
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity < 1) {
      this.removeItem(productId);
      return;
    }

    const currentItems = this.itemsSignal();
    const updatedItems = currentItems.map(item =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    this.itemsSignal.set(updatedItems);
    this.saveCart();
  }

  updateQuestions(productId: string, questions: string[]): void {
    const currentItems = this.itemsSignal();
    const updatedItems = currentItems.map(item =>
      item.product.id === productId ? { ...item, questions } : item
    );
    this.itemsSignal.set(updatedItems);
    this.saveCart();
  }

  removeItem(productId: string): void {
    const currentItems = this.itemsSignal();
    this.itemsSignal.set(currentItems.filter(item => item.product.id !== productId));
    this.saveCart();
  }

  clearCart(): void {
    this.itemsSignal.set([]);
    this.storage.remove('cart');
  }

  getItemsForCheckout(): { productId: string; quantity: number; questions?: string[] }[] {
    return this.itemsSignal().map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
      questions: item.questions
    }));
  }
}
