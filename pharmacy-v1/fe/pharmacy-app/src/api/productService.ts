import axiosClient from './axiosClient';

import {
  Product,
  ProductParams,
} from '../types/product';

import { ApiResponse, Brand, Category, PageResponse } from '../types';

const productService = {
  // 1. Lấy danh sách sản phẩm (có lọc)
  getAll: async (params: ProductParams = {}) => {
    const url = '/products';
    const queryParams = {
      pageIndex: 1,
      pageSize: 10,
      ...params,
    };

    return axiosClient.get<ApiResponse<PageResponse<Product>>>(url, { params: queryParams });
  },

  // 2. Lấy chi tiết sản phẩm
  getDetail: async (slug: string) => {
    const url = `/products/slug/${slug}`;
    const response = axiosClient.get<ApiResponse<Product>>(url)
    console.log(response)
    return response;
  },

  getRelated: async (id: number) => {
    const url = `/products/related/${id}`;
    return axiosClient.get<ApiResponse<Product[]>>(url);
  }
};

export default productService;