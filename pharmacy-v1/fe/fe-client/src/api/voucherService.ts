import type { ApiResponse, PageResponse } from '../types';
import type { Voucher, UserVoucherRequest } from '../types/voucher.types';
import axiosClient from './axiosClient';

const voucherService = {
  getVouchers: (pageIndex: number = 1, pageSize: number = 10, type?: string, status: string = 'ACTIVE') => {
    const params: any = { pageIndex, pageSize, status };
    if (type) params.type = type;
    return axiosClient.get<ApiResponse<PageResponse<Voucher[]>>>('/vouchers', { params });
  },

  getUserVouchers: (pageIndex: number = 1, pageSize: number = 10, type?: string, status?: string) => {
    const params: any = { pageIndex, pageSize };
    if (type) params.type = type;
    if (status) params.status = status;
    console.log("log")
    return axiosClient.get<ApiResponse<PageResponse<Voucher[]>>>('/vouchers/user/me', { params });
  },

  claimVoucher: (data: UserVoucherRequest) => {
    return axiosClient.post<ApiResponse<void>>('/vouchers/claim', data);
  },

  getVoucherById: (id: number) => {
    return axiosClient.get<ApiResponse<Voucher>>(`/vouchers/${id}`);
  }
};

export default voucherService;