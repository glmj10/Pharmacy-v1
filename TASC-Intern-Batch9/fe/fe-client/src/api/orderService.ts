import axiosClient from './axiosClient';
import type { ApiResponse, PageResponse} from '../types';
import type { OrderRequest, OrderResponse, OrderDetailResponse } from '../types/order.types';


const orderService = {
  createOrder: (data: OrderRequest) => {
    return axiosClient.post<ApiResponse<{ paymentUrl?: string; orderId: number }>>('/orders', data);
  },

  getMyOrders: (pageIndex: number = 1, pageSize: number = 10, status?: string) => {
    const params: any = { pageIndex, pageSize };
    if (status) params.status = status;
    return axiosClient.get<ApiResponse<PageResponse<OrderResponse[]>>>('/orders/my-orders', { params });
  },

  getOrderDetail: (id: number) => {
    return axiosClient.get<ApiResponse<OrderDetailResponse[]>>(`/orders/detail/${id}`);
  },

  cancelOrder: (id: number) => {
    return axiosClient.put<ApiResponse<void>>(`/orders/cancel/${id}`);
  }
};

export default orderService;