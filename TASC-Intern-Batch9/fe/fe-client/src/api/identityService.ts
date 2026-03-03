import axiosClient from './axiosClient';
import type { ApiResponse, User } from '../types';

// Interface cho Response trả về khi Login
interface AuthResponse {
  token: string;
}

// Interface cho Reset Password
interface ResetPasswordRequest {
  otp: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  profilePic?: string;
  createdAt?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserInfoRequest {
  username: string;
}

const identityService = {
  // 1. Đăng nhập (Sửa: Dùng email, path /auth/login)
  login: (data: { email: string; password: string }) => {
    return axiosClient.post<ApiResponse<AuthResponse>>('/auth/login', data, {isPublic: true} as any );
  },

  // 2. Đăng ký (Sửa: path /auth/register, gửi kèm confirmPassword)
  register: (data: {
    email: string;
    username: string;
    password: string;
    confirmPassword: string
  }) => {
    return axiosClient.post<ApiResponse<string>>('/auth/register', data, {isPublic: true} as any);
  },

  verifyAccount: (data: { email: string; otp: string }) => {
    return axiosClient.patch<ApiResponse<string>>('/auth/verify', data, {isPublic: true} as any);
  },

  logout: () => {
    // Token sẽ được axiosClient tự động lấy từ LocalStorage và gắn vào Header (như cấu hình bài trước)
    return axiosClient.post<ApiResponse<void>>('/auth/logout');
  },

  resendVerificationEmail: (email: string) => {
    return axiosClient.post<ApiResponse<void>>('/auth/send-verification-email', null, {
      params: { email }, 
      isPublic: true
    } as any);
  },

  forgotPassword: (email: string) => {
    return axiosClient.post<ApiResponse<string>>('/auth/forgot-password', null, {
      params: { email }, 
      isPublic: true
    } as any);
  },

  changePassword: (data: ChangePasswordRequest) => {
    return axiosClient.put<ApiResponse<string>>('/auth/change-password', data);
  },


  changeInfo: (info: UserInfoRequest, file?: File) => {
    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(info)], {
      type: 'application/json'
    });
    formData.append('info', jsonBlob);

    if (file) {
      formData.append('profilePic', file);
    }

    return axiosClient.put<ApiResponse<User>>('/auth/info', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  resetPassword: (data: ResetPasswordRequest) => {
    return axiosClient.put<ApiResponse<void>>('/auth/reset-password', data, {isPublic: true} as any);
  },

  // Giữ nguyên hàm lấy profile (nếu có API này) để lấy thông tin user sau khi có token
  getCurrentUser: () => axiosClient.get('/users/me') // Ví dụ, tùy backend của bạn
};

export default identityService;