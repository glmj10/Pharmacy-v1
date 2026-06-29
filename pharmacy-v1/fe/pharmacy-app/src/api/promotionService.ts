import axiosClient from './axiosClient';
import { ApiResponse, PageResponse } from '../types';
import { Promotion, PromotionItemResponse } from '../types/promotion';

const promotionService = {
  getCurrentPromotions: () => {
    return axiosClient.get<ApiResponse<Promotion[]>>('/promotions/products/current');
  },

  getPromotionItems: (eventId: number | string, pageIndex: number = 0, pageSize: number = 10) => {
    return axiosClient.get<ApiResponse<PageResponse<PromotionItemResponse[]>>>(`/promotion-items/${eventId}`, {
      params: {
        pageIndex,
        pageSize
      }
    });
  },

  getPromotionDetail: async (id: number) => {
    const res = await promotionService.getCurrentPromotions();
    const list = res.data.data || res.data; // Handle potential API wrapper
    if (Array.isArray(list)) {
        return list.find(p => p.id == id);
    }
    return null;
  }
};

export default promotionService;
