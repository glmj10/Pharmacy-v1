import axiosClient from './axiosClient';
import { ApiResponse } from '../types';
import { Banner } from '../types/banner';

const bannerService = {
  getPublicBanners: () => {
    return axiosClient.get<ApiResponse<Banner[]>>('/banners');
  }
};

export default bannerService;
