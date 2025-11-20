import api from './api';
import publicApi from './publicApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  // Đăng nhập
  login: async (credentials: { email: string; password: string }) => {
    const response = await publicApi.post('/auth/login', credentials);
    
    if (!response.data || !response.data.data || !response.data.data.token) {
      throw new Error('Invalid login response from server');
    }
    
    // Lưu token và user info vào AsyncStorage
    const { token, ...userData } = response.data.data;
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    
    return response.data;
  },

  // Đăng ký
  register: async (userData: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber?: string;
  }) => {
    const response = await publicApi.post('/auth/register', userData);
    return response.data;
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    
    if (response?.data) {
      const userData = {
        ...response.data,
        profilePic: response.data.profilePic || 
                    response.data.profilePicUrl || 
                    response.data.profilePicture,
      };
      
      // Cập nhật user info trong storage
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      return {
        ...response,
        data: userData,
      };
    }
    
    return response.data;
  },

  // Lấy user đã lưu trong storage
  getStoredUser: async () => {
    try {
      const userString = await AsyncStorage.getItem('user');
      if (userString) {
        const userData = JSON.parse(userString);
        return {
          ...userData,
          profilePic: userData.profilePic || 
                      userData.profilePicUrl || 
                      userData.profilePicture,
        };
      }
      return null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  },

  // Đăng xuất
  logout: async () => {
    try {
      // Call logout API if needed
      // await api.post('/auth/logout');
      
      // Clear storage
      await AsyncStorage.multiRemove(['token', 'user', 'refreshToken']);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear storage even if API call fails
      await AsyncStorage.multiRemove(['token', 'user', 'refreshToken']);
    }
  },

  // Refresh token
  refreshToken: async (refreshToken: string) => {
    const response = await publicApi.post('/auth/refresh', { refreshToken });
    
    if (response.data?.data?.token) {
      await AsyncStorage.setItem('token', response.data.data.token);
      if (response.data.data.refreshToken) {
        await AsyncStorage.setItem('refreshToken', response.data.data.refreshToken);
      }
    }
    
    return response.data;
  },

  // Kiểm tra token có hợp lệ không
  isAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      return !!token;
    } catch (error) {
      return false;
    }
  },

  // Request password reset
  requestPasswordReset: async (email: string) => {
    const response = await publicApi.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string) => {
    const response = await publicApi.post('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  },

  // Verify account
  verifyAccount: async (token: string) => {
    const response = await publicApi.post('/auth/verify-account', { token });
    return response.data;
  },

  // Resend verification email
  resendVerificationEmail: async (email: string) => {
    const response = await publicApi.post('/auth/resend-verification', { email });
    return response.data;
  },
};
