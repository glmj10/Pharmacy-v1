import axiosClient from './axiosClient';
import type { ApiResponse, Profile } from '../types';
import type { ProfileRequest } from '../types/profile.types';

const profileService = {
  // Lấy danh sách địa chỉ
  getUserProfiles: () => {
    return axiosClient.get<ApiResponse<Profile[]>>('/profiles');
  },

  // Lấy chi tiết 1 địa chỉ
  getProfileById: (id: number) => {
    return axiosClient.get<ApiResponse<Profile>>(`/profiles/${id}`);
  },

  // Tạo mới
  createProfile: (data: ProfileRequest) => {
    return axiosClient.post<ApiResponse<Profile>>('/profiles', data);
  },

  // Cập nhật
  updateProfile: (id: number, data: ProfileRequest) => {
    return axiosClient.put<ApiResponse<Profile>>(`/profiles/${id}`, data);
  },

  // Xóa
  deleteProfile: (id: number) => {
    return axiosClient.delete<ApiResponse<void>>(`/profiles/${id}`);
  }
};

export default profileService;