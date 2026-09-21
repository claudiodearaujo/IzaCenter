export type ProductType = 'QUESTION' | 'SESSION' | 'MONTHLY' | 'SPECIAL';
export type ServiceKind = 'SERVICE' | 'SESSION' | 'PACKAGE' | 'ASYNC_SERVICE' | 'DIGITAL_PRODUCT' | (string & {});

export interface ServiceCapabilities {
  scheduling?: { enabled: boolean; durationMinutes?: number };
  intake?: { enabled: boolean; maxQuestions?: number };
  digitalDelivery?: { enabled: boolean; format?: 'TEXT' | 'PDF' | 'AUDIO' | 'VIDEO' | 'MIXED' };
  recurring?: { enabled: boolean; sessions?: number; cadence?: string };
  specialtyModule?: { key: string; config?: Record<string, unknown> };
  [key: string]: unknown;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  categoryId?: string;
  category?: ProductCategory;
  name: string;
  slug: string;
  shortDescription?: string;
  fullDescription?: string;
  productType: ProductType;
  serviceKind: ServiceKind;
  capabilities: ServiceCapabilities;
  price: number;
  originalPrice?: number;
  numQuestions?: number;
  sessionDurationMinutes?: number;
  numCards?: number;
  validityDays: number;
  coverImageUrl?: string;
  galleryUrls: string[];
  isActive: boolean;
  isFeatured: boolean;
  requiresScheduling: boolean;
  maxPerClient?: number;
  metaTitle?: string;
  metaDescription?: string;
  availableFrom?: string;
  availableUntil?: string;
  createdAt: string;
  updatedAt: string;
}
