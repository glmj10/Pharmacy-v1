import axiosClient from './axiosClient';
import type { Category } from '../types/category.types';
import type { ApiResponse } from '../types';

const categoryService = {
  // 1. API Lấy cây danh mục (Thường dùng cho Sản phẩm)
  getCategoriesTree: () => {
    return axiosClient.get<ApiResponse<Category[]>>('/categories');
  },

  // 2. ===> API MỚI: Lấy danh mục Blog <===
  getBlogCategories: () => {
    return axiosClient.get<ApiResponse<Category[]>>('/categories/blogs/all');
  },

  getCategoryBySlug: (slug: string) => {
    return axiosClient.get<ApiResponse<Category>>(`/categories/${slug}`);
  }
};

export default categoryService;