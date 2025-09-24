import api from './api';
import { UserTransform } from '../utils/dataTransform';

// Helper function to transform user data for consistency
const transformUserData = (userData) => {
  if (!userData) return userData;
  
  return {
    ...userData,
    profilePic: userData.profilePic || userData.profilePicUrl || userData.profilePicture
  };
};

export const userService = {
  getCurrentUser: async () => {
    try {
      const response = await api.get('/users/me');
      
      if (!response) {
        throw new Error('No response received from server');
      }
      
      return {
        ...response,
        data: transformUserData(response.data)
      };
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      throw error;
    }
  },

  updateUser: async (userData) => {
    try {
      console.log('updateUser called with:', userData);
      
      const requestData = {
        username: userData.username,
        email: userData.email
      };
      
      console.log('Sending request data:', requestData);
      
      const formData = new FormData();
      formData.append('info', new Blob([JSON.stringify(requestData)], {
        type: 'application/json'
      }));

      const response = await api.put('/auth/info', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('API response:', response);
      
      // Check if response exists and has data
      if (!response) {
        throw new Error('No response received from server');
      }
      
      const result = {
        ...response,
        data: transformUserData(response.data)
      };
      
      console.log('Transformed result:', result);
      
      return result;
    } catch (error) {
      console.error('Error in updateUser:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  updateUserWithAvatar: async (userInfo, profilePic) => {
    try {
      const formData = new FormData();
      
      if (userInfo) {
        const requestData = UserTransform.toBackendUserInfo(userInfo);
        formData.append('info', new Blob([JSON.stringify(requestData)], {
          type: 'application/json'
        }));
      }
      
      if (profilePic) {
        formData.append('profilePic', profilePic);
      }

      const response = await api.put('/auth/info', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (!response) {
        throw new Error('No response received from server');
      }
      
      return {
        ...response,
        data: transformUserData(response.data)
      };
    } catch (error) {
      console.error('Error in updateUserWithAvatar:', error);
      throw error;
    }
  },

  updateProfilePicture: async (profilePic) => {
    try {
      const formData = new FormData();
      formData.append('profilePic', profilePic);

      const response = await api.put('/auth/info', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (!response) {
        throw new Error('No response received from server');
      }
      
      return {
        ...response,
        data: transformUserData(response.data)
      };
    } catch (error) {
      console.error('Error in updateProfilePicture:', error);
      throw error;
    }
  },

  changePassword: async (passwordData) => {
    try {
      const requestData = UserTransform.toBackendPasswordRequest(passwordData);
      const response = await api.put('/auth/change-password', requestData);
      
      if (!response) {
        throw new Error('No response received from server');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error in changePassword:', error);
      throw error;
    }
  },
};