import '@prisma/client';

// Augment the base Prisma types with relations
declare module '@prisma/client' {
  interface Appointment {
    client: User;
    orderItem: OrderItem | null;
  }

  interface Order {
    client: User;
    items: OrderItem[];
  }

  interface OrderItem {
    order: Order;
    product: Product;
    reading: Reading | null;
    appointment: Appointment | null;
  }

  interface Reading {
    client: User;
    orderItem: OrderItem;
    cards: ReadingCard[];
  }

  interface ReadingCard {
    reading: Reading;
    card: CiganoCard;
  }

  interface ProductCategory {
    products: Product[];
    _count: { products: number };
  }

  interface Product {
    category: ProductCategory | null;
    attachments: ProductAttachment[];
    orderItems: OrderItem[];
  }

  interface ProductAttachment {
    product: Product;
  }

  interface CiganoCard {
    readingCards: ReadingCard[];
  }

  interface Testimonial {
    client: User | null;
  }

  interface User {
    orders: Order[];
    readings: Reading[];
    appointments: Appointment[];
    notifications: Notification[];
    testimonials: Testimonial[];
  }

  interface Notification {
    user: User;
  }

  interface PrismaClientOptions {
    adapter?: any;
    log?: Array<
      | 'query'
      | 'info'
      | 'warn'
      | 'error'
      | {
          emit: 'stdout' | 'event';
          level: 'query' | 'info' | 'warn' | 'error';
        }
    >;
  }

  interface Decimal {
    // Add aliases for common methods
    mul(n: any): Decimal;
    div(n: any): Decimal;
    add(n: any): Decimal;
    sub(n: any): Decimal;
    gte(n: any): boolean;
  }

  interface DecimalConstructor {
    new (value: any): Decimal;
  }

  namespace Prisma {
    export const Decimal: typeof import('@prisma/client').Decimal;
  }
}
