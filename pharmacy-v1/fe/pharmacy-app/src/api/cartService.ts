import axiosClient from './axiosClient';
import { ApiResponse } from '../types';
import { AddToCartRequest, CartItem, CartResponse } from '../types/cart';

const cartService = {
  // 1. Lấy giỏ hàng
  getCart: () => {
    return axiosClient.get<ApiResponse<CartResponse>>('/carts');
  },

  // 2. Lấy tổng số lượng item (để hiện badge trên icon giỏ hàng)
  getTotalItems: () => {
    return axiosClient.get<ApiResponse<number>>('/carts/item/totalItems');
  },

  // 3. Thêm vào giỏ
  addToCart: (data: AddToCartRequest) => {
    return axiosClient.post<ApiResponse<CartItem>>('/carts', data);
  },

  // 4. Cập nhật số lượng (PUT /carts/item/{itemId}?quantity=...)
  updateQuantity: (itemId: number, quantity: number) => {
    return axiosClient.put<ApiResponse<CartItem>>(`/carts/item/${itemId}`, null, {
      params: { quantity }
    });
  },

  // 5. Chọn/Bỏ chọn 1 item
  toggleSelection: (itemId: number, selected: boolean) => {
    return axiosClient.patch<ApiResponse<null>>(`/carts/item/status/${itemId}`, null, {
      params: { selected }
    });
  },

  // 6. Chọn/Bỏ chọn tất cả
  toggleAll: (selected: boolean) => {
    return axiosClient.put<ApiResponse<null>>('/carts/item/status/all', null, {
      params: { selected }
    });
  },

  // 7. Xóa 1 item
  removeItem: (itemId: number) => {
    return axiosClient.delete<ApiResponse<null>>(`/carts/item/${itemId}`);
  },

  // 8. Xóa hết giỏ hàng
  clearCart: () => {
    return axiosClient.delete<ApiResponse<null>>('/carts');
  }
};

export default cartService;