export interface CiganoCard {
  id: string;
  number: number;
  name: string;
  nameEn?: string;
  nameEs?: string;
  nameFr?: string;
  keywords: string[];
  generalMeaning?: string;
  loveMeaning?: string;
  careerMeaning?: string;
  healthMeaning?: string;
  advice?: string;
  imageUrl: string;
  isPositive?: boolean;
  element?: string;
}
