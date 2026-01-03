export type ProductType = 'QUESTION' | 'SESSION' | 'MONTHLY' | 'SPECIAL';

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
