import axiosClient from './axiosClient';
import { ApiResponse, PageResponse } from '../types';
import { RateRequest, RateResponse } from '../types/rate';

const rateService = {
  createRate: (data: RateRequest) => {
    return axiosClient.post<ApiResponse<RateResponse>>('/rates', data);
  },

  getRatesByProduct: (
    productId: number,
    pageIndex: number = 1,
    pageSize: number = 10,
    rating?: number
  ) => {
    const params: any = { pageIndex, pageSize };
    if (rating) {
      params.rating = rating;
    }
    return axiosClient.get<ApiResponse<PageResponse<RateResponse[]>>>(`/rates/${productId}`, {
      params
    });
  }
};

export default rateService;