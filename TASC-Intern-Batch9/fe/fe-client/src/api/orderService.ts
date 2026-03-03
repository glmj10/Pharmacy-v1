import axiosClient from './axiosClient';
import type { ApiResponse, Order, PageResponse} from '../types';
import type { OrderRequest, OrderResponse, OrderDetailResponse } from '../types/order.types';


const orderService = {
  createOrder: (data: OrderRequest) => {
    return axiosClient.post<ApiResponse<{ paymentUrl?: string; orderId: number }>>('/orders', data);
  },

  getMyOrders: (pageIndex: number = 1, status?: string) => {
    const params: any = { pageIndex, pageSize: 10 };
    console.log("status")
    if (status && status !== 'ALL') {
      params.status = status;
    }
    return axiosClient.get<ApiResponse<PageResponse<Order>>>('/orders/my-orders', { params });
  },

  getOrderDetail: (id: number) => {
    return axiosClient.get<ApiResponse<OrderDetailResponse[]>>(`/orders/detail/${id}`);
  },

  cancelOrder: (id: number) => {
    return axiosClient.put<ApiResponse<void>>(`/orders/cancel/${id}`);
  },

  
};

export default orderService;