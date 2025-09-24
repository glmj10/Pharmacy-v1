import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = authService.getStoredUser();

    if (token && user) {
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (credentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const apiResponse = await authService.login(credentials);

      if (apiResponse && apiResponse.data && apiResponse.data.token) {
        localStorage.setItem('token', apiResponse.data.token);

        const userResponse = await authService.getCurrentUser();
        if (userResponse && userResponse.data) {
          const userData = {
            ...userResponse.data.data,
            profilePic: userResponse.data.data.profilePicUrl
          };

          localStorage.setItem('user', JSON.stringify(userData));

          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: userData,
              token: apiResponse.data.token
            },
          });
        } else {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: null,
              token: apiResponse.data.token
            },
          });
        }
      } else {
        throw new Error('Invalid login response from server');
      }

      return apiResponse;
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (error?.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error?.message) {
        throw new Error(error.message);
      }
      throw error;
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authService.register(userData);
      dispatch({ type: 'SET_LOADING', payload: false });
      return response;
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      if (error?.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error?.message) {
        throw new Error(error.message);
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      const result = await authService.logout();
      if (result && result.message) {
        toast.success(result.message);
      }
    } catch (error) {
      console.log('Logout completed with cleanup');
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateUser = async (userData) => {
    try {
      const response = await userService.updateUser(userData);

      if (!response) {
        throw new Error('No response received from server');
      }

      if (!response.data) {
        console.warn('Response received but no data found:', response);
        throw new Error('Invalid response structure from server');
      }

      if (response && response.data) {
        const userData = {
          ...response.data.data,
          profilePic: response.data.data.profilePicUrl
        };

        localStorage.setItem('user', JSON.stringify(userData));
        dispatch({
          type: 'UPDATE_USER',
          payload: userData
        });
        return response;
      }
    } catch (error) {
      console.error('Update user error:', error);
      // Re-throw error with more context
      if (error?.message) {
        throw new Error(error.message);
      }
      throw error;
    }
  };

  const forgotPassword = async (confirmationData) => {
    try {
      const response = await authService.forgotPassword(confirmationData);
      return response;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  };

  const resetPassword = async (resetData) => {
    try {
      const response = await authService.resetPassword(resetData);
      return response;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const updateUserLocal = (userData) => {
    try {
      localStorage.setItem('user', JSON.stringify(userData));
      dispatch({
        type: 'UPDATE_USER',
        payload: userData
      });
    } catch (error) {
      console.error('Update user local error:', error);
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    updateUserLocal,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
