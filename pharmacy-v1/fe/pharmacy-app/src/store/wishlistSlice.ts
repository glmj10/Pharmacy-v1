import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import wishlistService from '../api/wishlistService';
import { Product } from '../types/product';

interface WishlistState {
  items: Product[];
  loading: boolean;
  actionLoading: boolean; // Loading riêng cho add/remove
  error: string | null;
  totalPages: number;
  currentPage: number;
  totalElements: number;
}

const initialState: WishlistState = {
  items: [],
  loading: false,
  actionLoading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
  totalElements: 0,
};

// 1. Lấy danh sách yêu thích
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchList',
  async (params: { pageIndex?: number; pageSize?: number } = {}, { rejectWithValue }) => {
    try {
      const { pageIndex = 1, pageSize = 10 } = params;
      const response = await wishlistService.getMyWishlist(pageIndex, pageSize);
      return { data: response.data.data, pageIndex };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể tải danh sách yêu thích'
      );
    }
  }
);

// 2. Thêm sản phẩm vào yêu thích
export const addToWishlist = createAsyncThunk(
  'wishlist/add',
  async (productId: number, { rejectWithValue }) => {
    try {
      await wishlistService.addToWishlist(productId);
      return productId;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể thêm vào yêu thích'
      );
    }
  }
);

// 3. Xóa sản phẩm khỏi yêu thích
export const removeFromWishlist = createAsyncThunk(
  'wishlist/remove',
  async (productIds: number[], { rejectWithValue }) => {
    try {
      await wishlistService.removeFromWishlist(productIds);
      return productIds;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể xóa sản phẩm khỏi yêu thích'
      );
    }
  }
);

// 4. Xóa toàn bộ danh sách yêu thích
export const clearWishlist = createAsyncThunk(
  'wishlist/clear',
  async (_, { rejectWithValue }) => {
    try {
      await wishlistService.clearWishlist();
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể xóa danh sách yêu thích'
      );
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    // Cập nhật trạng thái inWishlist của sản phẩm trong items list
    setItemWishlistStatus(
      state,
      action: PayloadAction<{ productId: number; inWishlist: boolean }>
    ) {
      const item = state.items.find((p) => p.id === action.payload.productId);
      if (item) {
        item.inWishlist = action.payload.inWishlist;
      }
    },
    clearWishlistError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch wishlist
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        const { data, pageIndex } = action.payload;
        if (pageIndex === 1) {
          state.items = data.content;
        } else {
          // Tải thêm - tránh trùng lặp
          const existingIds = new Set(state.items.map((p) => p.id));
          state.items = [
            ...state.items,
            ...data.content.filter((p) => !existingIds.has(p.id)),
          ];
        }
        state.totalPages = data.totalPages;
        state.currentPage = data.currentPage;
        state.totalElements = data.totalElements;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add to wishlist
    builder
      .addCase(addToWishlist.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(addToWishlist.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // Remove from wishlist
    builder
      .addCase(removeFromWishlist.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.actionLoading = false;
        // Xóa các sản phẩm đã remove khỏi store
        const removedIds = new Set(action.payload);
        state.items = state.items.filter((p) => !removedIds.has(p.id));
        state.totalElements = Math.max(0, state.totalElements - removedIds.size);
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // Clear wishlist
    builder
      .addCase(clearWishlist.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(clearWishlist.fulfilled, (state) => {
        state.actionLoading = false;
        state.items = [];
        state.totalElements = 0;
        state.currentPage = 1;
      })
      .addCase(clearWishlist.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setItemWishlistStatus, clearWishlistError } = wishlistSlice.actions;
export default wishlistSlice.reducer;
