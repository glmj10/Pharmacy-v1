import axiosClient from './axiosClient';
import { ApiResponse, PageResponse } from '../types';
import { Product } from '../types/product';

const wishlistService = {
  // 1. Lấy danh sách yêu thích (có phân trang)
  getMyWishlist: (pageIndex: number = 1, pageSize: number = 10) => {
    return axiosClient.get<ApiResponse<PageResponse<Product>>>('/wishlists/my-wishlist', {
      params: { pageIndex, pageSize },
    });
  },

  // 2. Thêm sản phẩm vào danh sách yêu thích
  addToWishlist: (productId: number) => {
    return axiosClient.post<ApiResponse<void>>('/wishlists', null, {
      params: { productId },
    });
  },

  // 3. Xóa một hoặc nhiều sản phẩm khỏi danh sách yêu thích
  removeFromWishlist: (productIds: number[]) => {
    return axiosClient.delete<ApiResponse<void>>('/wishlists/remove', {
      params: { productIds },
      paramsSerializer: (params) => {
        const searchParams = new URLSearchParams();
        (params.productIds as number[]).forEach((id) =>
          searchParams.append('productIds', id.toString())
        );
        return searchParams.toString();
      },
    });
  },

  // 4. Xóa toàn bộ danh sách yêu thích
  clearWishlist: () => {
    return axiosClient.delete<ApiResponse<void>>('/wishlists/clear');
  },
};

export default wishlistService;
