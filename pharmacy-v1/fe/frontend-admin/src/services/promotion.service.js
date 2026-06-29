import api from '../config/api';
import { ENDPOINTS } from '../config/constants';
import { apiUtils } from '../utils/apiUtils';

class PromotionService {
    // ===== Promotion Event APIs =====
    async getPromotionEvents(params = {}) {
        try {
            const response = await api.get(ENDPOINTS.PROMOTIONS.GET_ALL, { params });
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async getCurrentPromotionEvents() {
        try {
            const response = await api.get(ENDPOINTS.PROMOTIONS.GET_CURRENT);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async createPromotionEvent(data, thumbnail) {
        try {
            const formData = new FormData();
            formData.append('promotion', new Blob([JSON.stringify(data)], { type: 'application/json' }));
            if (thumbnail) {
                formData.append('thumbnail', thumbnail);
            }

            const response = await api.post(ENDPOINTS.PROMOTIONS.CREATE, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async updatePromotionEvent(id, data, thumbnail) {
        try {
            const formData = new FormData();
            if (data) {
                formData.append('promotion', new Blob([JSON.stringify(data)], { type: 'application/json' }));
            }
            if (thumbnail) {
                formData.append('thumbnail', thumbnail);
            }

            const response = await api.put(ENDPOINTS.PROMOTIONS.UPDATE(id), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async deletePromotionEvent(id) {
        try {
            const response = await api.delete(ENDPOINTS.PROMOTIONS.DELETE(id));
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async changePromotionStatus(id, status) {
        try {
            const response = await api.patch(ENDPOINTS.PROMOTIONS.CHANGE_STATUS(id), null, {
                params: { status }
            });
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    // ===== Promotion Item APIs =====
    async getPromotionItems(eventId, params = {}) {
        try {
            const response = await api.get(ENDPOINTS.PROMOTIONS.GET_ITEMS(eventId), { params });
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async createPromotionItems(data) {
        try {
            const response = await api.post(ENDPOINTS.PROMOTIONS.CREATE_ITEMS, data);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async updatePromotionItem(promotionItemId, data) {
        try {
            const response = await api.put(ENDPOINTS.PROMOTIONS.UPDATE_ITEM(promotionItemId), data);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async deletePromotionItems(ids) {
        try {
            const response = await api.delete(ENDPOINTS.PROMOTIONS.DELETE_ITEMS, { data: ids });
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }
}

export default new PromotionService();
