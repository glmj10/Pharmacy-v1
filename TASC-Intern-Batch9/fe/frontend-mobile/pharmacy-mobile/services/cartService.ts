import api from './api';
import { CartItem } from '../types';

export const cartService = {
  // Lấy giỏ hàng
  getCart: async (): Promise<CartItem[]> => {
    const response = await api.get('/carts');
    
    // Xử lý response structure từ backend
    if (response.data?.data) {
      return Array.isArray(response.data.data) ? response.data.data : [];
    } else if (response.data) {
      return Array.isArray(response.data) ? response.data : [];
    } else if (response) {
      return Array.isArray(response) ? response : [];
    }
    
    return [];
  },

  // Thêm sản phẩm vào giỏ
  addToCart: async (productId: number, quantity: number = 1) => {
    const response = await api.post('/carts', {
      productId,
      quantity,
    });
    
    // Xử lý response structure
    if (response.data?.data) {
      return response.data.data;
    } else if (response.data) {
      return response.data;
    }
    
    return response;
  },

  // Lấy tổng số items trong giỏ
  getTotalCartItems: async (): Promise<number> => {
    const response = await api.get('/carts/item/totalItems');
    
    // Xử lý response structure
    if (response.data?.data !== undefined) {
      return typeof response.data.data === 'number' ? response.data.data : 0;
    } else if (response.data !== undefined) {
      return typeof response.data === 'number' ? response.data : 0;
    }
    
    return 0;
  },

  // Cập nhật số lượng sản phẩm
  updateCartItem: async (itemId: number, quantity: number) => {
    const response = await api.put(`/carts/item/${itemId}?quantity=${quantity}`);
    
    // Xử lý response structure
    if (response.data?.data) {
      return response.data.data;
    } else if (response.data) {
      return response.data;
    }
    
    return response;
  },

  // Xóa sản phẩm khỏi giỏ
  removeFromCart: async (itemId: number) => {
    const response = await api.delete(`/carts/item/${itemId}`);
    
    // Xử lý response structure
    if (response.data?.data) {
      return response.data.data;
    } else if (response.data) {
      return response.data;
    }
    
    return response;
  },

  // Cập nhật trạng thái selected của item (để checkout)
  updateCartItemStatus: async (itemId: number, selected: boolean) => {
    const response = await api.patch(`/carts/item/status/${itemId}?selected=${selected}`);
    
    // Xử lý response structure
    if (response.data?.data) {
      return response.data.data;
    } else if (response.data) {
      return response.data;
    }
    
    return response;
  },

  // Cập nhật trạng thái selected của tất cả items
  updateAllCartItemsStatus: async (selected: boolean) => {
    const response = await api.put(`/carts/item/status/all?selected=${selected}`);
    
    // Xử lý response structure
    if (response.data?.data) {
      return response.data.data;
    } else if (response.data) {
      return response.data;
    }
    
    return response;
  },

  // Lấy các items đã chọn để checkout
  getCartItemsForCheckout: async (): Promise<CartItem[]> => {
    const response = await api.get('/carts/item/checkout');
    
    // Xử lý response structure từ backend
    if (response.data?.data) {
      return Array.isArray(response.data.data) ? response.data.data : [];
    } else if (response.data) {
      return Array.isArray(response.data) ? response.data : [];
    } else if (response) {
      return Array.isArray(response) ? response : [];
    }
    
    return [];
  },

  // Xóa toàn bộ giỏ hàng
  clearCart: async () => {
    const response = await api.delete('/carts');
    
    // Xử lý response structure
    if (response.data?.data) {
      return response.data.data;
    } else if (response.data) {
      return response.data;
    }
    
    return response;
  },
};
