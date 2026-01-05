import type { PaymentMethod, PaymentStatus } from "./payment.types";
import type { Product } from "./product.types";

export type OrderStatus = 'PENDING' | 'SHIPPING' | 'CANCELLED' | 'DELIVERED' | 'FAILED';

export interface OrderRequest {
  profileId: number;
  note: string;
  paymentMethod: PaymentMethod,
  voucherId?: number;
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
  rated: boolean
}

