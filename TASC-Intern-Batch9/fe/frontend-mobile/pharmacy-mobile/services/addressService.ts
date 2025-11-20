import api from './api';
import { Address } from '../types';

export const addressService = {
  // Lấy danh sách địa chỉ
  getAddresses: async (): Promise<Address[]> => {
    const response = await api.get('/addresses');
    
    // Xử lý response structure từ backend
    if (response.data?.data) {
      return Array.isArray(response.data.data) ? response.data.data : [];
    } else if (response.data) {
      return Array.isArray(response.data) ? response.data : [];
    } else if (response) {
      return Array.isArray(response) ? response : [];
    }
    
    return [];
  },

  // Lấy địa chỉ mặc định
  getDefaultAddress: async (): Promise<Address | null> => {
    const response = await api.get('/addresses/default');
    
    // Xử lý response structure từ backend
    if (response.data?.data) {
      return response.data.data;
    } else if (response.data) {
      return response.data;
    }
    
    return null;
  },

  // Tạo địa chỉ mới
  createAddress: async (addressData: {
    fullName: string;
    phoneNumber: string;
    address: string;
    isDefault?: boolean;
  }): Promise<Address | null> => {
    const response = await api.post('/addresses', addressData);
    
    // Xử lý response structure
    if (response.data?.data) {
      return response.data.data;
    } else if (response.data) {
      return response.data;
    }
    
    return null;
  },

  // Cập nhật địa chỉ
  updateAddress: async (addressId: number, addressData: Partial<Address>): Promise<Address | null> => {
    const response = await api.put(`/addresses/${addressId}`, addressData);
    
    // Xử lý response structure
    if (response.data?.data) {
      return response.data.data;
    } else if (response.data) {
      return response.data;
    }
    
    return null;
  },

  // Xóa địa chỉ
  deleteAddress: async (addressId: number): Promise<boolean> => {
    const response = await api.delete(`/addresses/${addressId}`);
    
    // Xử lý response structure - trả về success status
    if (response.data?.data !== undefined) {
      return Boolean(response.data.data);
    } else if (response.data !== undefined) {
      return Boolean(response.data);
    }
    
    return true; // Nếu không có lỗi thì coi như thành công
  },

  // Đặt địa chỉ mặc định
  setDefaultAddress: async (addressId: number): Promise<Address | null> => {
    const response = await api.put(`/addresses/${addressId}/set-default`);
    
    // Xử lý response structure
    if (response.data?.data) {
      return response.data.data;
    } else if (response.data) {
      return response.data;
    }
    
    return null;
  },
};
