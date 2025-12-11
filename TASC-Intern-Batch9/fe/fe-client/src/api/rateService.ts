import axiosClient from './axiosClient';
import type { ApiResponse} from '../types';
import type {RateRequest, RateResponse } from '../types/rate.types'

const rateService = {
  // Tạo đánh giá mới
  createRate: (data: RateRequest) => {
    return axiosClient.post<ApiResponse<RateResponse>>('/rates', data);
  }
};

export default rateService;