import api, { setLoggingOut } from './api';
import publicApi from './publicApi';

export const authService = {
  login: async (credentials) => {
    const response = await publicApi.post('/auth/login', credentials);
    if (!response.data || !response.data.data || !response.data.data.token) {
      throw new Error('Invalid login response from server');
    }
    
    return response.data;
  },

  register: async (userData) => {
    const response = await publicApi.post('/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    
    if (response?.data) {
      const userData = {
        ...response.data,
        profilePic: response.data.profilePic || response.data.profilePicUrl || response.data.profilePicture
      };
      
      return {
        ...response,
        data: userData
      };
    }
    
    return response.data;
  },

  getStoredUser: () => {
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        return {
          ...userData,
          profilePic: userData.profilePic || userData.profilePicUrl || userData.profilePicture
        };
      }
      return null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  },

  logout: async () => {
    try {
      setLoggingOut(true);
      
      await api.post('/auth/logout');
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      return { success: true, message: 'Đăng xuất thành công!' };
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { success: true, message: 'Đăng xuất thành công!' };
    } finally {
      setLoggingOut(false);
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  refreshToken: async (refreshData) => {
    const response = await publicApi.post('/auth/refresh-token', refreshData);

    return response.data;
  },

  forgotPassword: async (confirmationData) => {
    const response = await publicApi.post('/auth/forgot-password', confirmationData);
    return response.data;
  },

  resetPassword: async (resetData) => {
    const { password, confirmPassword, token } = resetData;
    const response = await publicApi.put('/auth/reset-password', {
      resetToken: token,
      password,
      confirmPassword
    });
    return response.data;
  }

};
