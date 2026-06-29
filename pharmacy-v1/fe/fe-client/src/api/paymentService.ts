import axiosClient from './axiosClient';
import type { ApiResponse } from '../types';

const paymentService = {
  // Xử lý VNPay Return (Callback)
  handleVnPayReturn: (params: any) => {
    return axiosClient.get<ApiResponse<string>>('/payments/vnpay-return', { params });
  },

  repayOrder: (orderId: number) => {
    return axiosClient.get<ApiResponse<{ paymentUrl: string }>>(`/payments/repay/${orderId}`);
  }
};

export default paymentService;