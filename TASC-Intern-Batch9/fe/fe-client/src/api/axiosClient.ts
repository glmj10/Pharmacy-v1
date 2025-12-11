import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import config from '../lib/config';
import { triggerSessionExpired } from '../lib/events';

const baseURL = config.api.baseUrl;

const axiosClient = axios.create({
  baseURL: baseURL,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// --- CƠ CHẾ KHÓA & HÀNG ĐỢI ---
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
  (reqConfig: any) => { // Dùng type any để chấp nhận property 'isPublic' tự thêm
    
    // ===> LOGIC MỚI: BỎ QUA TOKEN NẾU LÀ PUBLIC API <===
    if (reqConfig.isPublic) {
      return reqConfig;
    }

    const token = localStorage.getItem('access_token');
    if (token && reqConfig.headers) {
      reqConfig.headers.Authorization = `Bearer ${token}`;
    }
    return reqConfig;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Nếu không phải lỗi 401, reject luôn
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Nếu request này đã retry rồi mà vẫn lỗi -> Chứng tỏ refresh thất bại hoặc token mới vẫn sai -> Reject luôn
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // --- XỬ LÝ CONCURRENCY ---

    // Nếu đang có một request khác đang refresh token
    if (isRefreshing) {
      // Return một Promise để "treo" request này lại, đợi khi nào refresh xong thì resolve
      return new Promise(function (resolve, reject) {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          // Khi refresh xong, lấy token mới gắn vào header và gọi lại
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = 'Bearer ' + token;
          }
          return axiosClient(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    // Nếu chưa có ai refresh, thì request này chịu trách nhiệm gọi API refresh
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const oldToken = localStorage.getItem('access_token');
      if (!oldToken) throw new Error("No token");

      // Gọi API Refresh (Dùng axios gốc để tránh interceptor loop)
      const res = await axios.post(`${baseURL}/auth/refresh-token`, {
        token: oldToken
      });

      // Lấy token mới từ response
      const newToken = res.data.data?.token || res.data.result?.token;

      // 1. Lưu token mới
      localStorage.setItem('access_token', newToken);

      // 2. Cập nhật header cho request hiện tại
      axiosClient.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = 'Bearer ' + newToken;
      }

      // 3. Xử lý hàng đợi: Báo cho các request đang chờ biết là đã có token mới
      processQueue(null, newToken);

      // 4. Gọi lại request hiện tại
      return axiosClient(originalRequest);

    } catch (refreshError) {
      // Nếu Refresh thất bại
      processQueue(refreshError, null); // Báo lỗi cho các request đang chờ

      localStorage.removeItem('access_token');
      localStorage.removeItem('user_info');

      triggerSessionExpired(); // Bắn sự kiện hiển thị Modal

      return Promise.reject(refreshError);
    } finally {
      // Dù thành công hay thất bại, cũng phải mở khóa
      isRefreshing = false;
    }
  }
);

export default axiosClient;