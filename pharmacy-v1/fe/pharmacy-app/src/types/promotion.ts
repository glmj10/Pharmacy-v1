import { Product } from './product';

export type PromotionStatus = 'UPCOMING' | 'ONGOING' | 'CANCELLED' | 'ENDED';

export interface Promotion {
  id: number;
  name: string;
  thumbnailUrl: string;
  startTime: string; 
  endTime: string;
  status: PromotionStatus;
}

export interface PromotionItemResponse {
  id: number;
  salePrice: number; 
  product: Product; 
}
