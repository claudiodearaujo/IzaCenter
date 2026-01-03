/**
 * Integration Test Setup
 * 
 * These tests run against a real database (test database).
 * Make sure to have a TEST_DATABASE_URL environment variable set.
 */

import { PrismaClient, ProductType } from '@prisma/client';

// Use a separate Prisma instance for integration tests
export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
    },
  },
});

/**
 * Clean all tables in the test database
 */
export async function cleanDatabase() {
  const tablenames = await testPrisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ');

  if (tables.length > 0) {
    try {
      await testPrisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    } catch (error) {
      console.log('Error cleaning database:', error);
    }
  }
}

/**
 * Create test data fixtures
 */
export async function createTestUser(data: {
  email?: string;
  fullName?: string;
  role?: 'CLIENT' | 'ADMIN';
  password?: string;
}) {
  return testPrisma.user.create({
    data: {
      email: data.email || `test-${Date.now()}@test.com`,
      fullName: data.fullName || 'Test User',
      role: data.role || 'CLIENT',
      passwordHash: data.password || 'hashedpassword123',
    },
  });
}

export async function createTestCategory(data: {
  name?: string;
  slug?: string;
}) {
  return testPrisma.productCategory.create({
    data: {
      name: data.name || `Test Category ${Date.now()}`,
      slug: data.slug || `test-category-${Date.now()}`,
      isActive: true,
    },
  });
}

export async function createTestProduct(data: {
  name?: string;
  categoryId: string;
  price?: number;
}) {
  return testPrisma.product.create({
    data: {
      name: data.name || `Test Product ${Date.now()}`,
      slug: `test-product-${Date.now()}`,
      shortDescription: 'Test product description',
      price: data.price || 100,
      categoryId: data.categoryId,
      productType: ProductType.QUESTION,
      isActive: true,
    },
  });
}

export async function createTestCard(data: {
  number?: number;
  name?: string;
}) {
  return testPrisma.ciganoCard.create({
    data: {
      number: data.number || Math.floor(Math.random() * 1000),
      name: data.name || `Test Card ${Date.now()}`,
      keywords: ['test', 'card'],
      imageUrl: 'https://example.com/card.jpg',
    },
  });
}

export async function createTestOrder(data: {
  clientId: string;
  items: Array<{ productId: string; productName: string; quantity: number; unitPrice: number }>;
}) {
  const total = data.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  return testPrisma.order.create({
    data: {
      orderNumber: `ORD-TEST-${Date.now()}`,
      clientId: data.clientId,
      subtotal: total,
      total,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      items: {
        create: data.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          productType: ProductType.QUESTION,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
        })),
      },
    },
    include: {
      items: true,
    },
  });
}

/**
 * Disconnect test database after all tests
 */
export async function disconnectTestDatabase() {
  await testPrisma.$disconnect();
}
