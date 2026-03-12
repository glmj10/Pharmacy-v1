import { ApiResponse, Brand } from "../types";
import axiosClient from "./axiosClient";


export const brandService = {
    getBrands: async () => {
        const url = '/brands/customer/public';
        return axiosClient.get<ApiResponse<Brand[]>>(url);
    }
}