import { ApiResponse, Category } from '../types';
import axiosClient from './axiosClient';


export const categoryService = {
    getCategories: async () => {
        const url = '/categories';
        const response = axiosClient.get<ApiResponse<Category[]>>(url)
        return response;
    },

    getProductCategories: async () => {
        const url = '/categories/products/all'
        return axiosClient.get<ApiResponse<Category[]>>(url)
    }
}

export default categoryService;