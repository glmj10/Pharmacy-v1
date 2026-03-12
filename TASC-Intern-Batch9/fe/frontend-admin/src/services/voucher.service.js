import api from '../config/api';
import { ENDPOINTS } from '../config/constants';
import { apiUtils } from '../utils/apiUtils';

class VoucherService {
    async getVouchers(params = {}) {
        try {
            const response = await api.get(ENDPOINTS.VOUCHERS.GET_ALL, { params });
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async getVoucherById(id) {
        try {
            const response = await api.get(ENDPOINTS.VOUCHERS.GET_BY_ID(id));
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async createVoucher(data) {
        try {
            const response = await api.post(ENDPOINTS.VOUCHERS.CREATE, data);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async updateVoucher(id, data) {
        try {
            const response = await api.put(ENDPOINTS.VOUCHERS.UPDATE(id), data);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async deleteVoucher(id) {
        try {
            const response = await api.delete(ENDPOINTS.VOUCHERS.DELETE(id));
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async getUserVouchers(params = {}) {
        try {
            const response = await api.get(ENDPOINTS.VOUCHERS.GET_USER_VOUCHERS, { params });
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }

    async claimVoucher(data) {
        try {
            const response = await api.post(ENDPOINTS.VOUCHERS.CLAIM, data);
            return apiUtils.fromAxiosResponse(response);
        } catch (error) {
            throw apiUtils.fromAxiosError(error);
        }
    }
}

export default new VoucherService();
