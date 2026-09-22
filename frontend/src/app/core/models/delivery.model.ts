import { ServiceCapabilities, ServiceKind } from './product.model';

export type DeliveryStatus = 'PENDING' | 'IN_PROGRESS' | 'PUBLISHED' | 'ARCHIVED';

export interface DeliveryContent {
  introduction?: string;
  body?: string;
  recommendations?: string;
  goals?: string;
  closing?: string;
  [key: string]: unknown;
}

export interface DeliverySpecialtyModule {
  key: string;
  version?: number;
  config?: Record<string, unknown>;
}

export interface DeliveryCard {
  id?: string;
  cardId: string;
  card?: {
    id: string;
    name: string;
    imageUrl?: string;
    keywords?: string[];
  };
  position: number;
  positionName?: string;
  isReversed?: boolean;
  interpretation?: string;
}

export interface Delivery {
  id: string;
  orderItemId: string;
  clientId: string;
  title?: string;
  status: DeliveryStatus;
  deliveryType: string;
  content: DeliveryContent;
  specialtyModule?: DeliverySpecialtyModule | null;
  metadata?: Record<string, unknown>;

  // Legacy aliases kept while Reading is being retired.
  clientQuestion?: string;
  focusArea?: string;
  introduction?: string;
  generalGuidance?: string;
  recommendations?: string;
  goals?: string;
  closingMessage?: string;
  interpretation?: string;
  advice?: string;
  conclusion?: string;

  audioUrl?: string;
  videoUrl?: string;
  pdfUrl?: string;
  readingDate?: string | Date;
  publishedAt?: string | Date;
  expiresAt?: string | Date;
  pdfGeneratedAt?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;

  client?: {
    id: string;
    fullName: string;
    email: string;
  };

  product?: {
    id: string;
    name: string;
    slug?: string;
    coverImageUrl?: string;
    productType?: string;
    serviceKind?: ServiceKind;
    capabilities?: ServiceCapabilities;
  };

  orderItem?: {
    product: {
      id: string;
      name: string;
      slug?: string;
      coverImageUrl?: string;
      productType?: string;
      serviceKind?: ServiceKind;
      capabilities?: ServiceCapabilities;
    };
    clientQuestions?: string[];
    questions?: string[];
  };

  cards?: DeliveryCard[];
}

export interface UpdateDeliveryDTO {
  title?: string;
  deliveryType?: string;
  content?: DeliveryContent;
  specialtyModule?: DeliverySpecialtyModule | null;
  metadata?: Record<string, unknown>;

  // Legacy aliases accepted during migration.
  introduction?: string;
  generalGuidance?: string;
  recommendations?: string;
  goals?: string;
  closingMessage?: string;
  interpretation?: string;
  advice?: string;
  conclusion?: string;

  cards?: {
    cardId: string;
    position: number;
    positionName?: string;
    interpretation?: string;
    isReversed?: boolean;
  }[];
}
