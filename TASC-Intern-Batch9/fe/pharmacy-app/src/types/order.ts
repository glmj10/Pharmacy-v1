import { Product } from './product';


export type OrderStatus = 'PENDING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED' | 'FAILED';

export interface Order {
  id: number;
  totalPrice: number;
  note: string;
  customerName: string;
  customerAddress: string;
  status: OrderStatus;
  paymentMethod: 'COD' | 'VNPAY';
  paymentStatus: string;
  createdAt: string; 
}

export interface OrderRequest {
  profileId: number;
  note: string;
  paymentMethod: 'COD' | 'VNPAY';
  voucherId?: number;
}

export interface OrderResponse {
  paymentUrl?: string;
  orderId: number;
}

export interface OrderDetail {
  id: number;
  quantity: number;
  priceAtOrder: number;
  product: Product;
}

export interface OrderDetail {
  id: number;
  quantity: number;
  priceAtOrder: number;
  product: Product;
  rated: boolean;
}