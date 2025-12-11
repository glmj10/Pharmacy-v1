import axiosClient from './axiosClient';
import type { ApiResponse } from '../types';
import type { CartItemRequest, CartItemResponse, CartResponse } from '../types/cart.types';

const cartService = {
  // Lấy toàn bộ giỏ hàng
  getCart: () => {
    return axiosClient.get<ApiResponse<CartResponse>>('/carts');
  },

  // Lấy tổng số lượng item (để hiện badge trên header)
  getTotalItems: () => {
    return axiosClient.get<ApiResponse<number>>('/carts/item/totalItems');
  },

  // Thêm sản phẩm
  addItemToCart: (data: CartItemRequest) => {
    return axiosClient.post<ApiResponse<CartItemResponse>>('/carts', data);
  },

  // Cập nhật số lượng (PUT /carts/item/{itemId}?quantity=...)
  updateItemQuantity: (itemId: number, quantity: number) => {
    return axiosClient.put<ApiResponse<CartItemResponse>>(`/carts/item/${itemId}`, null, {
      params: { quantity }
    });
  },

  // Chọn/Bỏ chọn 1 sản phẩm (PATCH /carts/item/status/{itemId}?selected=...)
  updateItemStatus: (itemId: number, status: boolean) => {
    return axiosClient.patch<ApiResponse<CartItemResponse>>(`/carts/item/status/${itemId}`, null, {
      params: { selected: status }
    });
  },

  // Chọn/Bỏ chọn tất cả (PUT /carts/item/status/all?selected=...)
  selectAllItems: (status: boolean) => {
    return axiosClient.put<ApiResponse<CartItemResponse[]>>('/carts/item/status/all', null, {
      params: { selected: status }
    });
  },

  // Xóa 1 sản phẩm
  removeItemFromCart: (itemId: number) => {
    return axiosClient.delete<ApiResponse<void>>(`/carts/item/${itemId}`);
  },

  // Xóa toàn bộ giỏ hàng
  clearCart: () => {
    return axiosClient.delete<ApiResponse<void>>('/carts');
  }
};

export default cartService;