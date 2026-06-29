import axiosClient from './axiosClient';
import type { Category } from '../types/category.types';
import type { ApiResponse } from '../types';

const categoryService = {
  getCategoriesTree: () => {
    return axiosClient.get<ApiResponse<Category[]>>('/categories');
  },

  getBlogCategories: () => {
    return axiosClient.get<ApiResponse<Category[]>>('/categories/blogs/all');
  },

  getCategoryBySlug: (slug: string) => {
    return axiosClient.get<ApiResponse<Category>>(`/categories/${slug}`);
  },

  getProductCategories: () => {
    return axiosClient.get<ApiResponse<Category[]>>(`/categories/products/all`);
  },
};

export default categoryService;