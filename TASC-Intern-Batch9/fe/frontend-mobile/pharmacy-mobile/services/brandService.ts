import publicApi from './publicApi';
import { Brand } from '../types';

export const brandService = {
  // Lấy tất cả brands (public endpoint)
  getAllBrands: async (): Promise<Brand[]> => {
    try {
      const response = await publicApi.get('/brands/customer/public');
      
      // Xử lý response structure từ backend
      if (response.data?.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      } else if (response.data) {
        return Array.isArray(response.data) ? response.data : [];
      } else if (response) {
        return Array.isArray(response) ? response : [];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching brands:', error);
      throw error;
    }
  },

  // Lấy brand theo ID
  getBrandById: async (id: number): Promise<Brand | null> => {
    const response = await publicApi.get(`/brands/${id}`);
    
    // Xử lý response structure từ backend
    if (response.data?.data) {
      return response.data.data;
    } else if (response.data) {
      return response.data;
    } else if (response) {
      return response;
    }
    
    return null;
  },

  // Lấy brand theo slug
  getBrandBySlug: async (slug: string): Promise<Brand | null> => {
    const response = await publicApi.get(`/brands/slug/${slug}`);
    
    // Xử lý response structure từ backend
    if (response.data?.data) {
      return response.data.data;
    } else if (response.data) {
      return response.data;
    } else if (response) {
      return response;
    }
    
    return null;
  },
};
