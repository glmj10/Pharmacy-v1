// src/types/index.ts

import type { Product } from './index'; // Import Product đã có

// 1. Request thêm vào giỏ
export interface CartItemRequest {
  productId: number;
  quantity: number;
}

// 2. Response từng item trong giỏ
export interface CartItemResponse {
  id: number; // Đây là CartItemID, khác với ProductID
  product: Product; // ProductResponse map sang Product frontend
  quantity: number;
  priceAtAddition: number;
  priceDifferent: number;
  priceChangeType: string;
  selected: boolean;
  isOutOfStock: boolean;
}

// 3. Response toàn bộ giỏ hàng
export interface CartResponse {
  id: number;
  cartItems: CartItemResponse[];
}