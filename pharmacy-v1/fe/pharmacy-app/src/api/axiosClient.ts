import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Alert } from 'react-native';
import { API_BASE_URL } from '../constants/config';
import { getToken, saveToken, removeToken } from '../utils/storage';
import { router } from 'expo-router';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosClient.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes('/auth/refresh-token')) {
      return handleSessionExpired();
    }

    if (!originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return axiosClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        const oldToken = await getToken();
        
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          token: oldToken
        });

        const newToken = response.data.data.token;

        await saveToken(newToken);
        
        axiosClient.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
        originalRequest.headers['Authorization'] = 'Bearer ' + newToken;

        processQueue(null, newToken);
        
        return axiosClient(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        return handleSessionExpired();
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// --- HÀM XỬ LÝ KHI PHIÊN HẾT HẠN (Logout) ---
const handleSessionExpired = async () => {
  await removeToken();
  
  // Hiển thị thông báo cho người dùng
  Alert.alert(
    "Phiên đăng nhập hết hạn",
    "Vui lòng đăng nhập lại để tiếp tục sử dụng.",
    [
      {
        text: "Đăng nhập lại",
        onPress: () => {
          // Điều hướng về màn hình Login
          // Lưu ý: router của expo-router hoạt động tốt kể cả ngoài component
          router.replace('/(auth)/login'); 
        }
      }
    ],
    { cancelable: false } // Bắt buộc người dùng bấm nút
  );
  
  return Promise.reject("Session expired");
};

export default axiosClient;