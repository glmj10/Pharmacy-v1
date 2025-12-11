import axiosClient from './axiosClient';
import type { Category } from '../types/category.types';

const categoryService = {
  // Lấy toàn bộ cây danh mục
  // Backend trả về List<CategoryResponse> dạng cây (Root có children, children có children...)
  getCategoriesTree: () => {
    return axiosClient.get<Category[]>('/categories');
  },

  // (Tùy chọn) Lấy chi tiết 1 danh mục theo slug để hiển thị trang danh mục sau này
  getCategoryBySlug: (slug: string) => {
    return axiosClient.get<Category>(`/categories/${slug}`);
  }
};

export default categoryService;