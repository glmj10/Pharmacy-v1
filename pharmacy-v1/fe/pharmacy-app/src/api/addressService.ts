import axiosClient from './axiosClient';
import { ApiResponse, Address, AddressRequest } from '../types';

const addressApi = {
  getAll: () => axiosClient.get<ApiResponse<Address[]>>('/profiles'),

  create: (data: AddressRequest) => axiosClient.post<ApiResponse<Address>>('/profiles', data),

  update: (id: number, data: AddressRequest) => axiosClient.put<ApiResponse<Address>>(`/profiles/${id}`, data),

  delete: (id: number) => axiosClient.delete<ApiResponse<string>>(`/profiles/${id}`),
};

export default addressApi;