import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// Kiểm tra LocalStorage khi khởi tạo (để F5 không bị mất login)
const storedToken = localStorage.getItem('access_token');
const storedUser = localStorage.getItem('user_info');

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  isAuthenticated: !!storedToken, // Nếu có token -> true
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Action: Đăng nhập thành công -> Lưu vào State & LocalStorage
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;

      localStorage.setItem('access_token', action.payload.token);
      localStorage.setItem('user_info', JSON.stringify(action.payload.user));
    },

    // Action: Cập nhật thông tin user (ví dụ sau khi sửa profile)
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = { ...state.user, ...action.payload };

      const storedUser = localStorage.getItem('user_info');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const updatedUser = { ...parsedUser, ...action.payload };
        localStorage.setItem('user_info', JSON.stringify(updatedUser));
      }
    },

    clearAuth: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_info');
    }
  },
});

export const { loginSuccess, clearAuth, updateUser } = authSlice.actions
export default authSlice.reducer;