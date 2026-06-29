import type { Product } from ".";

export interface PromotionItemResponse {
  id: number;
  salePrice: number; 
  product: Product; 
}