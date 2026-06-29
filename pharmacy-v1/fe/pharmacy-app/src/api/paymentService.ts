import axiosClient from './axiosClient';
import { ApiResponse } from '../types';

const paymentService = {
  // Xử lý VNPay Return (Callback)
  handleVnPayReturn: (params: string) => {
    return axiosClient.get<ApiResponse<string>>('/payments/vnpay-return?' + params);
  },

  repayOrder: (orderId: number) => {
    return axiosClient.get<ApiResponse<{ paymentUrl: string }>>(`/payments/repay/${orderId}`);
  }
};

export default paymentService;
