import api from './api';

export const paymentService = {
    paymentVNPAYReturn: async (params) => {
        const response = await api.get('/payment/vnpay-return', { params });
        return response.data;
    },

    recreateVNPAYUrl: async (orderId) => {
        const response = await api.get('/payment/recreate-vnpay-url', { params: { orderId } });
        return response.data;
    }
}