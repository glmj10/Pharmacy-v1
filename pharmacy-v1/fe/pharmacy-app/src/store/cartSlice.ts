import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cartService from '../api/cartService';
import { CartItem } from '../types/cart';

interface CartState {
  items: CartItem[];
  totalItemsBadge: number; // Số hiển thị trên icon
  totalPrice: number;      // Tổng tiền các món đang chọn
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  totalItemsBadge: 0,
  totalPrice: 0,
  loading: false,
  error: null,
};

// --- ASYNC THUNKS ---

// 1. Lấy giỏ hàng
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartService.getCart();
      return response.data.data.cartItems;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Lỗi tải giỏ hàng');
    }
  }
);

// 2. Lấy số lượng badge (gọi nhẹ hơn fetchCart)
export const fetchTotalItems = createAsyncThunk(
  'cart/fetchTotalItems',
  async () => {
    try {
      const response = await cartService.getTotalItems();
      return response.data.data;
    } catch (error) {
      return 0;
    }
  }
);

// 3. Thêm vào giỏ
export const addToCart = createAsyncThunk(
  'cart/add',
  async (params: { productId: number; quantity: number }, { dispatch, rejectWithValue }) => {
    try {
      await cartService.addToCart(params);
      // Sau khi thêm thành công, gọi lại badge để cập nhật số
      dispatch(fetchTotalItems());
      return true; 
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Không thể thêm vào giỏ');
    }
  }
);

// 4. Update số lượng
export const updateCartQuantity = createAsyncThunk(
  'cart/updateQty',
  async (params: { itemId: number; quantity: number }, { dispatch }) => {
    await cartService.updateQuantity(params.itemId, params.quantity);
    dispatch(fetchCart()); // Reload lại giỏ để đồng bộ giá/km
  }
);

// 5. Toggle chọn item
export const toggleCartItem = createAsyncThunk(
  'cart/toggleItem',
  async (params: { itemId: number; selected: boolean }, { dispatch }) => {
    await cartService.toggleSelection(params.itemId, params.selected);
    dispatch(fetchCart());
  }
);

// 6. Toggle All
export const toggleAllItems = createAsyncThunk(
  'cart/toggleAll',
  async (selected: boolean, { dispatch }) => {
    await cartService.toggleAll(selected);
    dispatch(fetchCart());
  }
);

// 7. Remove Item
export const removeCartItem = createAsyncThunk(
  'cart/remove',
  async (itemId: number, { dispatch }) => {
    await cartService.removeItem(itemId);
    dispatch(fetchCart());
    dispatch(fetchTotalItems());
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch Cart
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        
        // Tính tổng tiền các món được chọn (selected == true)
        state.totalPrice = state.items.reduce((sum, item) => {
          if (item.selected) {
            return sum + (item.product.priceNew * item.quantity);
          }
          return sum;
        }, 0);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Badge Count
    builder.addCase(fetchTotalItems.fulfilled, (state, action) => {
      state.totalItemsBadge = action.payload;
    });
  },
});

export default cartSlice.reducer;