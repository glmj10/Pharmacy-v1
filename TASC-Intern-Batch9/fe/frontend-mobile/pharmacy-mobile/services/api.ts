import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration - Sử dụng IP của máy tính trong mạng LAN thay vì localhost
// Để lấy IP: chạy 'ipconfig' trong terminal và tìm IPv4 Address
const API_BASE_URL = 'http://192.168.31.49:8080/api/v1';
const API_TIMEOUT = 30000;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Thêm token vào mỗi request
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from storage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Xử lý lỗi và refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // TODO: Implement refresh token logic
        // const refreshToken = await AsyncStorage.getItem('refreshToken');
        // const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        // await AsyncStorage.setItem('token', response.data.token);
        // originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
        // return api(originalRequest);

        // For now, just clear storage and require login
        await AsyncStorage.multiRemove(['token', 'user']);
        // TODO: Navigate to login screen
      } catch (refreshError) {
        await AsyncStorage.multiRemove(['token', 'user']);
        return Promise.reject(refreshError);
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
