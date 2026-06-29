import api from '../config/api';
import { ENDPOINTS } from '../config/constants';
import { apiUtils } from '../utils/apiUtils';

class BannerService {
    async getBanners(params = {}) {
        try {
            const response = await api.get(ENDPOINTS.BANNERS.GET_ALL, { params });
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async getAllBannersForAdmin(isActive = null) {
        try {
            const params = isActive !== null ? { isActive } : {};
            const response = await api.get(ENDPOINTS.BANNERS.GET_ALL_ADMIN, { params });
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async getBannerById(id) {
        try {
            const response = await api.get(ENDPOINTS.BANNERS.GET_BY_ID(id));
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async createBanner(bannerData, imageFile) {
        try {
            const formData = new FormData();
            
            // Add banner JSON data as a blob
            const bannerBlob = new Blob([JSON.stringify(bannerData)], {
                type: 'application/json'
            });
            formData.append('banner', bannerBlob);
            
            // Add image file
            if (imageFile) {
                formData.append('image', imageFile);
            }
            
            const response = await api.post(ENDPOINTS.BANNERS.CREATE, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async updateBanner(id, bannerData, imageFile) {
        try {
            const formData = new FormData();
            
            // Add banner JSON data as a blob
            const bannerBlob = new Blob([JSON.stringify(bannerData)], {
                type: 'application/json'
            });
            formData.append('banner', bannerBlob);
            
            // Add image file if provided
            if (imageFile) {
                formData.append('image', imageFile);
            }
            
            const response = await api.put(ENDPOINTS.BANNERS.UPDATE(id), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async deleteBanner(id) {
        try {
            const response = await api.delete(ENDPOINTS.BANNERS.DELETE(id));
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }
}

export default new BannerService();
