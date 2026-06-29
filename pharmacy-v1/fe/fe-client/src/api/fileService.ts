import axiosClient from './axiosClient';
import type { ApiResponse } from '../types';

const fileService = {
  getFileUrl: (uuid: string) => {
    return axiosClient.get<ApiResponse<String>>('/files/file-url', {
      params: { uuid }
    });
  }
};

export default fileService;