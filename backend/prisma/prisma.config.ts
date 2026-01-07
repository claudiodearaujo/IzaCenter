// apps/backend/prisma/prisma.config.ts
// Prisma 7+ configuration file for migration operations

import { defineConfig } from '@prisma/client';

export default defineConfig({
  adapter: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL,
  },
});
