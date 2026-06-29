import type { ApiResponse } from '../types';
import type { Banner } from '../types/banner.type';
import axiosClient from './axiosClient';

const bannerService = {
  // GET /banners
  getPublicBanners: () => {
    return axiosClient.get<ApiResponse<Banner[]>>('/banners');
  }
};

export default bannerService;