import { Product } from './product';

export interface CartItem {
  id: number;              // ID của dòng trong giỏ hàng
  product: Product;        // Thông tin sản phẩm
  quantity: number;        // Số lượng
  priceAtAddition: number; // Giá lúc thêm vào
  selected: boolean;       // Đã chọn để thanh toán chưa
  isOutOfStock: boolean;   // Hết hàng hay không
}

export interface CartResponse {
  id: number;
  cartItems: CartItem[];
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}