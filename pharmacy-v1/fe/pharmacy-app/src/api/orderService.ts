import axiosClient from './axiosClient';
import { ApiResponse, Order, OrderDetail, OrderRequest, OrderResponse, PageResponse } from '../types';

const orderService = {
    createOrder: (data: OrderRequest) => {
        return axiosClient.post<ApiResponse<OrderResponse>>('/orders', data);
    },

    getMyOrders: (pageIndex: number = 1, status?: string) => {
        const params: any = { pageIndex, pageSize: 10 };
        if (status && status !== 'ALL') {
            params.status = status;
        }
        return axiosClient.get<ApiResponse<PageResponse<Order>>>('/orders/my-orders', { params });
    },

    getOrderDetail: (orderId: number) => {
        return axiosClient.get<ApiResponse<OrderDetail[]>>(`/orders/detail/${orderId}`);
    },

    cancelOrder: (orderId: number) => {
        return axiosClient.put<ApiResponse<string>>(`/orders/cancel/${orderId}`);
    }
};

export default orderService;