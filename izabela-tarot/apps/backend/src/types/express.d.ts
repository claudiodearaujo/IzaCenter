// apps/backend/src/types/express.d.ts

import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: 'CLIENT' | 'ADMIN';
      };
      file?: Express.Multer.File;
      files?: Express.Multer.File[];
    }
  }
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: 'CLIENT' | 'ADMIN';
  iat?: number;
  exp?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  [key: string]: unknown;
}
