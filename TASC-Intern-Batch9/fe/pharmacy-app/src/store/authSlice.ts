import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosClient from '../api/axiosClient'; // Đảm bảo bạn đã có file này
import { saveToken, removeToken } from '../utils/storage'; // Đảm bảo bạn đã có file này
import authService from '../api/authService';
import { ChangePasswordRequest } from '../types';

// Định nghĩa kiểu dữ liệu User
export interface User {
  id: number;
  username: string;
  email: string;
  profilePic?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  token: null,
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string, password: string }, { rejectWithValue, dispatch }) => {
    try {
      const response = await authService.login(credentials);
      const token = response.data.data.token;

      await saveToken(token);

      dispatch(fetchUserProfile());

      return token;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Đăng nhập thất bại');
    }
  }
);

// 2. Lấy thông tin User (Profile)
export const fetchUserProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getMe();
      console.log(response)
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Không thể tải thông tin');
    }
  }
);


export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (data: ChangePasswordRequest, { rejectWithValue }) => {
    try {
      // Gọi API (authApi đã được định nghĩa ở các bước trước)
      const response = await authService.changePassword(data);
      return response.data.message; // Trả về message thành công
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Đổi mật khẩu thất bại');
    }
  }
);

// 3. Đăng xuất
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      // Gọi API logout nếu cần (optional)
      await authService.logout();
    } catch (e) {
      // Bỏ qua lỗi server
    }
    await removeToken();
    return;
  }
);

export const updateUserInfo = createAsyncThunk(
  'auth/updateInfo',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await authService.updateInfo(formData);
      return response.data.data; // Trả về User mới
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Lỗi cập nhật');
    }
  }
);
// --- Slice ---

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Action đồng bộ: Set token khi mở app
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    // Login Handling
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.token = action.payload;
      state.isAuthenticated = true;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Profile Handling
    builder.addCase(fetchUserProfile.fulfilled, (state, action) => {
      state.user = action.payload;
    });

    // Logout Handling
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    });

    builder.addCase(updateUserInfo.fulfilled, (state, action) => {
      state.user = action.payload;
    });
  },
});

export const { setToken } = authSlice.actions;
export default authSlice.reducer;