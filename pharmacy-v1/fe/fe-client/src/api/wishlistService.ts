import axiosClient from './axiosClient';
import type { ApiResponse, PageResponse } from '../types';
import type { Product } from '../types/product.types';

const wishlistService = {
  /** Lấy danh sách sản phẩm yêu thích của user */
  getMyWishlist: (pageIndex: number = 1, pageSize: number = 10) => {
    return axiosClient.get<ApiResponse<PageResponse<Product[]>>>('/wishlists/my-wishlist', {
      params: { pageIndex, pageSize },
    });
  },

  /** Thêm sản phẩm vào danh sách yêu thích */
  addToWishlist: (productId: number) => {
    return axiosClient.post<ApiResponse<void>>('/wishlists', null, {
      params: { productId },
    });
  },

  /** Xóa một hoặc nhiều sản phẩm khỏi danh sách yêu thích */
  removeFromWishlist: (productIds: number[]) => {
    return axiosClient.delete<ApiResponse<void>>('/wishlists/remove', {
      params: { productIds: productIds.join(',') },
    });
  },

  /** Xóa toàn bộ danh sách yêu thích */
  clearWishlist: () => {
    return axiosClient.delete<ApiResponse<void>>('/wishlists/clear');
  },
};

export default wishlistService;
