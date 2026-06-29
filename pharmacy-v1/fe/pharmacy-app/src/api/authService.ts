import axiosClient from './axiosClient';
import { ApiResponse, LoginRequest, RegisterRequest, User, AuthResponse, ChangePasswordRequest } from '../types';

const authService = {
  login: (data: LoginRequest) => axiosClient.post<ApiResponse<AuthResponse>>('/auth/login', data),
  register: (data: RegisterRequest) => axiosClient.post<ApiResponse<string>>('/auth/register', data),
  getMe: () => axiosClient.get<ApiResponse<User>>('/users/me'),
  logout: () => axiosClient.post<ApiResponse<null>>('/auth/logout'),
  
  // Update Profile (Multipart for Image)
  updateInfo: (formData: FormData) => {
    return axiosClient.put<ApiResponse<User>>('/auth/info', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  changePassword: (data: ChangePasswordRequest) => {
    return axiosClient.put<ApiResponse<string>>('/auth/change-password', data);
  }
};

export default authService;