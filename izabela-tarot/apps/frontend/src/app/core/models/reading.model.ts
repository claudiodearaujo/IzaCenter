import { CiganoCard } from './card.model';

export type ReadingStatus = 'PENDING' | 'IN_PROGRESS' | 'PUBLISHED' | 'ARCHIVED';

export interface ReadingCard {
  id: string;
  readingId: string;
  cardId: string;
  card: CiganoCard;
  position: number;
  positionName?: string;
  isReversed: boolean;
  interpretation?: string;
}

export interface Reading {
  id: string;
  orderItemId: string;
  clientId: string;
  title: string;
  status: ReadingStatus;
  clientQuestion?: string;
  focusArea?: string;
  introduction?: string;
  generalGuidance?: string;
  recommendations?: string;
  goals?: string;
  closingMessage?: string;
  audioUrl?: string;
  videoUrl?: string;
  readingDate?: string;
  publishedAt?: string;
  expiresAt?: string;
  pdfUrl?: string;
  pdfGeneratedAt?: string;
  createdAt: string;
  updatedAt: string;
  cards: ReadingCard[];
}
