import type { Product } from ".";
import type { PaymentMethod, PaymentStatus } from "./payment.types";

export type OrderStatus = 'PENDING' | 'SHIPPING' | 'CANCELLED' | 'DELIVERED' | 'FAILED';

export interface OrderRequest {
  profileId: number;
  note: string;
  paymentMethod: PaymentMethod;
}

export interface OrderResponse {
  id: number;
  totalPrice: number;
  note: string;
  customerName: string;
  customerPhoneNumber: string;
  customerAddress: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string; // ISO Date string
}

// Order Detail (Chi tiết 1 đơn hàng)
export interface OrderDetailResponse {
  id: number;
  quantity: number;
  priceAtOrder: number;
  product: Product
  isRated: boolean
}

