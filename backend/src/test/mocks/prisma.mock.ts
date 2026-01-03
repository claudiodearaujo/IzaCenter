import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

export type MockPrismaClient = DeepMockProxy<PrismaClient>;

export const prismaMock = mockDeep<PrismaClient>();

jest.mock('../../config/database', () => ({
  prisma: prismaMock,
}));

export { prismaMock as prisma };
