import type { ApiResponse } from '../types';
import type { Brand } from '../types/brand.types';
import axiosClient from './axiosClient';

const brandService = {
  getAllBrandsPublic: () => {
    return axiosClient.get<ApiResponse<Brand[]>>('/brands/customer/public');
  }
};

export default brandService;