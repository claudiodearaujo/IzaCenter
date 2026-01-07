// apps/backend/src/config/database.ts

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from './env';

// Create PostgreSQL adapter
const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });

// Create Prisma client with Prisma 7 adapter configuration
export const prisma = new PrismaClient({
  adapter,
  log: env.isDevelopment
    ? ['query', 'info', 'warn', 'error']
    : ['error'],
});

// Connect to database
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Disconnect from database
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.log('📤 Database disconnected');
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await disconnectDatabase();
});

export default prisma;
