import publicApi from './publicApi';
import { Category } from '../types';

export const categoryService = {
  // Lấy tất cả danh mục
  getAllCategories: async (): Promise<Category[]> => {
    const response = await publicApi.get('/categories');
    
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

  // Lấy danh mục theo ID
  getCategoryById: async (id: number): Promise<Category | null> => {
    const response = await publicApi.get(`/categories/${id}`);
    
    // Xử lý response structure từ backend
    if (response.data?.data) {
      return response.data.data;
    } else if (response.data) {
      return response.data;
    } 
    
    return null;
  },

  // Lấy danh mục con theo parent slug
  getCategoriesByParentSlug: async (parentSlug: string): Promise<Category[]> => {
    const response = await publicApi.get(`/categories/parent/${parentSlug}`);
    
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
};
