import axios from 'axios';

// API Configuration cho public endpoints (không cần authentication)
// Sử dụng IP của máy tính trong mạng LAN thay vì localhost
const API_BASE_URL = 'http://192.168.31.49:8080/api/v1';

const publicApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor - Xử lý lỗi chung
publicApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default publicApi;
