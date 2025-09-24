import api from './api'; // API với authentication và refresh token
import publicApi from './publicApi'; // API thuần public không cần token

// Helper function để handle API calls với fallback
const apiCall = async (endpoint, params = {}) => {
  try {
    const token = localStorage.getItem('token');
    const apiInstance = token ? api : publicApi;
    
    const response = await apiInstance.get(endpoint, { params });
    return response.data;
  } catch (error) {
    // Nếu lỗi với authenticated API (401, 500), fallback về publicApi
    if ((error.response?.status === 401 || error.response?.status === 500) && 
        localStorage.getItem('token')) {
      try {
        console.warn('Falling back to public API for:', endpoint);
        const response = await publicApi.get(endpoint, { params });
        return response.data;
      } catch (fallbackError) {
        console.error('Fallback request also failed:', fallbackError);
        throw fallbackError;
      }
    }
    throw error;
  }
};

export const productService = {
  getAllProducts: async (params = {}) => {
    const backendParams = {
      pageIndex: params.pageIndex || params.page || 1,
      pageSize: params.pageSize || params.limit || 10,
      title: params.title || params.search,
      category: params.category,
      brand: params.brand,
      priceFrom: params.priceFrom,
      priceTo: params.priceTo,
      isAscending: params.isAscending
    };

    Object.keys(backendParams).forEach(key => {
      if (backendParams[key] === undefined || backendParams[key] === '') {
        delete backendParams[key];
      }
    });

    const token = localStorage.getItem('token');
    const apiInstance = token ? api : publicApi;
    
    const response = await apiInstance.get('/products', { params: backendParams });
    return response.data;
  },

  getTop15ProductsByNumberOfLikes: async () => {
    return await apiCall('/products/rank/suggestions/top15');
  },

  getProductBySlug: async (slug) => {
    const token = localStorage.getItem('token');
    const apiInstance = token ? api : publicApi;
    
    const response = await apiInstance.get(`/products/slug/${slug}`);
    return response.data;
  },

  searchProducts: async (query, params = {}) => {
    const searchParams = {
      pageIndex: params.page || 1,
      pageSize: params.limit || 10,
      title: query,
      ...params
    };
    
    const token = localStorage.getItem('token');
    const apiInstance = token ? api : publicApi;
    
    const response = await apiInstance.get('/products', { params: searchParams });
    return response.data;
  },

  getProductsByCategory: async (categorySlug, params = {}) => {
    const searchParams = {
      pageIndex: params.page || 1,
      pageSize: params.limit || 10,
      categorySlug: categorySlug,
      ...params
    };
    
    const token = localStorage.getItem('token');
    const apiInstance = token ? api : publicApi;
    
    const response = await apiInstance.get('/products', { params: searchParams });
    return response.data;
  },

  get15ProductByBrandId: async (brandId) => {
    const token = localStorage.getItem('token');
    const apiInstance = token ? api : publicApi;
    
    const response = await apiInstance.get(`/products/brand/suggestions/top15?brandId=${brandId}`);
    return response.data;
  }
};
