import api from './api';
import publicApi from './publicApi';
import { Product, PaginatedResponse } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper function để handle API calls với fallback
const apiCall = async (endpoint: string, params = {}) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const apiInstance = token ? api : publicApi;
    
    const response = await apiInstance.get(endpoint, { params });
    return response.data;
  } catch (error: any) {
    // Nếu lỗi với authenticated API, fallback về publicApi
    if ((error.response?.status === 401 || error.response?.status === 500)) {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          console.warn('Falling back to public API for:', endpoint);
          const response = await publicApi.get(endpoint, { params });
          return response.data;
        }
      } catch (fallbackError) {
        console.error('Fallback request also failed:', fallbackError);
        throw fallbackError;
      }
    }
    throw error;
  }
};

export const productService = {
  // Lấy danh sách sản phẩm với pagination
  getAllProducts: async (params?: {
    page?: number;
    pageIndex?: number;
    limit?: number;
    pageSize?: number;
    title?: string;
    search?: string;
    category?: string;
    brand?: string;
    priceFrom?: number;
    priceTo?: number;
    isAscending?: boolean;
  }) => {
    const backendParams: any = {
      pageIndex: params?.pageIndex || params?.page || 1,
      pageSize: params?.pageSize || params?.limit || 10,
      title: params?.title || params?.search,
      category: params?.category,
      brand: params?.brand,
      priceFrom: params?.priceFrom,
      priceTo: params?.priceTo,
      isAscending: params?.isAscending,
    };

    // Remove undefined/empty values
    Object.keys(backendParams).forEach(key => {
      if (backendParams[key] === undefined || backendParams[key] === '' || backendParams[key] === null) {
        delete backendParams[key];
      }
    });

    const token = await AsyncStorage.getItem('token');
    const apiInstance = token ? api : publicApi;
    
    const response = await apiInstance.get('/products', { params: backendParams });
    
    // Xử lý response structure từ backend
    let productsData, totalPagesData, totalElementsData;
    
    if (response.data?.data?.content) {
      productsData = response.data.data.content;
      totalPagesData = response.data.data.totalPages;
      totalElementsData = response.data.data.totalElements;
    } else if (response.data?.content) {
      productsData = response.data.content;
      totalPagesData = response.data.totalPages;
      totalElementsData = response.data.totalElements;
    } else if (Array.isArray(response.data)) {
      productsData = response.data;
      totalPagesData = 1;
      totalElementsData = response.data.length;
    } else {
      productsData = [];
      totalPagesData = 1;
      totalElementsData = 0;
    }
    
    return {
      content: productsData || [],
      totalPages: totalPagesData || 1,
      totalElements: totalElementsData || 0,
    };
  },

  // Lấy chi tiết sản phẩm theo slug
  getProductBySlug: async (slug: string) => {
    const token = await AsyncStorage.getItem('token');
    const apiInstance = token ? api : publicApi;
    
    const response = await apiInstance.get(`/products/slug/${slug}`);
    return response.data;
  },

  // Lấy top 15 sản phẩm được yêu thích nhất
  getTop15ProductsByNumberOfLikes: async () => {
    const response = await publicApi.get('/products/top-15-products-by-number-of-likes');
    
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

  // Tìm kiếm sản phẩm
  searchProducts: async (query: string, params?: {
    page?: number;
    limit?: number;
  }) => {
    const searchParams = {
      pageIndex: params?.page || 1,
      pageSize: params?.limit || 10,
      title: query,
    };
    
    const token = await AsyncStorage.getItem('token');
    const apiInstance = token ? api : publicApi;
    
    const response = await apiInstance.get('/products', { params: searchParams });
    return response.data;
  },

  // Lấy sản phẩm theo category
  getProductsByCategory: async (categorySlug: string, params?: {
    page?: number;
    limit?: number;
  }) => {
    const searchParams = {
      pageIndex: params?.page || 1,
      pageSize: params?.limit || 10,
      categorySlug: categorySlug,
    };
    
    const token = await AsyncStorage.getItem('token');
    const apiInstance = token ? api : publicApi;
    
    const response = await apiInstance.get('/products', { params: searchParams });
    return response.data;
  },

  // Lấy 15 sản phẩm theo brand ID
  get15ProductByBrandId: async (brandId: number) => {
    const token = await AsyncStorage.getItem('token');
    const apiInstance = token ? api : publicApi;
    
    const response = await apiInstance.get(`/products/brand/${brandId}/top15`);
    return response.data;
  },
};
