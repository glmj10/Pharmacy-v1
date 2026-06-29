import type { ApiResponse, PageResponse } from '../types';
import type { Promotion } from '../types/promotion.type';
import type { PromotionItemResponse } from '../types/promotionItem';
import axiosClient from './axiosClient';

const promotionService = {
  getCurrentPromotions: () => {
    return axiosClient.get<ApiResponse<Promotion[]>>('/promotions/products/current');
  },

  getPromotionItems: (eventId: number | string, pageIndex: number = 0, pageSize: number = 10) => {
    return axiosClient.get<ApiResponse<PageResponse<PromotionItemResponse[]>>>(`/promotion-items/${eventId}`, {
      params: {
        pageIndex, // Backend nhận 0-based index
        pageSize
      }
    });
  },

  getPromotionDetail: async (id: number) => {
    // Gọi API lấy list current
    const res = await promotionService.getCurrentPromotions();
    console.log(res.data)
    const list = res.data;
    return list.find(p => p.id === id);
  }

};

export default promotionService;