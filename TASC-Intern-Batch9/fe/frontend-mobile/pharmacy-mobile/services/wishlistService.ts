import api from './api';

import { Product } from '../types';

export const wishlistService = {
  // Lấy danh sách wishlist
  getWishlist: async (): Promise<Product[]> => {
    const response = await api.get('/wishlists');
    
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

  // Thêm sản phẩm vào wishlist
  addToWishlist: async (productId: number) => {
    const response = await api.post('/wishlists', { productId });
    
    // Xử lý response structure
    if (response.data?.data) {
      return response.data.data;
    } else if (response.data) {
      return response.data;
    }
    
    return response;
  },

  // Xóa sản phẩm khỏi wishlist
  removeFromWishlist: async (productId: number) => {
    const response = await api.delete(`/wishlists/${productId}`);
    
    // Xử lý response structure
    if (response.data?.data) {
      return response.data.data;
    } else if (response.data) {
      return response.data;
    }
    
    return response;
  },

  // Kiểm tra sản phẩm có trong wishlist không
  isInWishlist: async (productId: number): Promise<boolean> => {
    const response = await api.get(`/wishlists/check/${productId}`);
    
    // Xử lý response structure
    if (response.data?.data !== undefined) {
      return Boolean(response.data.data);
    } else if (response.data !== undefined) {
      return Boolean(response.data);
    }
    
    return false;
  },

  // Clear toàn bộ wishlist
  clearWishlist: async () => {
    const response = await api.delete('/wishlists');
    
    // Xử lý response structure
    if (response.data?.data) {
      return response.data.data;
    } else if (response.data) {
      return response.data;
    }
    
    return response;
  },
};
