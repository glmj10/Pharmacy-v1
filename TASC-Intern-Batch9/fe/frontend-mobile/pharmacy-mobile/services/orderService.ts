import api from './api';
import { Order } from '../types';

export const orderService = {
  // Lấy danh sách đơn hàng
  getOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<Order[]> => {
    const response = await api.get('/orders', { params });
    
    // Xử lý response structure từ backend
    if (response.data?.data?.content) {
      return Array.isArray(response.data.data.content) ? response.data.data.content : [];
    } else if (response.data?.content) {
      return Array.isArray(response.data.content) ? response.data.content : [];
    } else if (response.data?.data) {
      return Array.isArray(response.data.data) ? response.data.data : [];
    } else if (response.data) {
      return Array.isArray(response.data) ? response.data : [];
    }
    
    return [];
  },

  // Lấy chi tiết đơn hàng
  getOrderById: async (orderId: number): Promise<Order | null> => {
    const response = await api.get(`/orders/${orderId}`);
    
    // Xử lý response structure từ backend
    if (response.data?.data) {
      return response.data.data;
    } else if (response.data) {
      return response.data;
    } else if (response) {
      return response;
    }
    
    return null;
  },

  // Tạo đơn hàng mới
  createOrder: async (orderData: {
    addressId: number;
    paymentMethod: string;
    note?: string;
    voucherCode?: string;
  }) => {
    const response = await api.post('/orders', orderData);
    
    // Xử lý response structure
    if (response.data?.data) {
      return response.data.data;
    } else if (response.data) {
      return response.data;
    }
    
    return response;
  },

  // Hủy đơn hàng
  cancelOrder: async (orderId: number, reason?: string) => {
    const response = await api.put(`/orders/${orderId}/cancel`, { reason });
    
    // Xử lý response structure
    if (response.data?.data) {
      return response.data.data;
    } else if (response.data) {
      return response.data;
    }
    
    return response;
  },

  // Xác nhận đã nhận hàng
  confirmReceived: async (orderId: number) => {
    const response = await api.put(`/orders/${orderId}/confirm-received`);
    
    // Xử lý response structure
    if (response.data?.data) {
      return response.data.data;
    } else if (response.data) {
      return response.data;
    }
    
    return response;
  },
};
