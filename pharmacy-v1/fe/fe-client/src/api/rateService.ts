import axiosClient from './axiosClient';
import type { ApiResponse, PageResponse } from '../types';
import type { RateRequest, RateResponse } from '../types/rate.types'

const rateService = {
  // Tạo đánh giá mới
  createRate: (data: RateRequest) => {
    return axiosClient.post<ApiResponse<RateResponse>>('/rates', data);
  },

  getRatesByProduct: (
    productId: number,
    pageIndex: number = 1,
    pageSize: number = 10,
    rating?: number // Optional: Lọc theo số sao
  ) => {
    const params: any = { pageIndex, pageSize };
    if (rating) {
      params.rating = rating;
    }
    console.log(productId)
    return axiosClient.get<ApiResponse<PageResponse<RateResponse[]>>>(`/rates/${productId}`, {
      params
    });
  }
};

export default rateService;