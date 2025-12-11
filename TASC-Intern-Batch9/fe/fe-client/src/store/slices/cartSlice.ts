import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import cartService from '../../api/cartService';
import type { CartItemResponse } from '../../types/cart.types';

interface CartState {
  items: CartItemResponse[];
  totalQuantity: number; // Số lượng hiển thị trên Badge
  totalPrice: number;    // Tổng tiền (của các món được chọn)
  loading: boolean;
}

const initialState: CartState = {
  items: [],
  totalQuantity: 0,
  totalPrice: 0,
  loading: false,
};

// Async Action: Lấy giỏ hàng từ Server
export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const res: any = await cartService.getCart();
    return res.data; // Trả về CartResponse
  } catch (error) {
    return rejectWithValue(error);
  }
});

// Async Action: Lấy tổng số lượng (cho Badge Header)
export const fetchTotalItems = createAsyncThunk('cart/fetchTotalItems', async () => {
  const res: any = await cartService.getTotalItems();
  return res.data; // Trả về number
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Action reset giỏ hàng khi đăng xuất
    resetCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
    }
  },
extraReducers: (builder) => {
    builder
      // Xử lý fetchCart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        
        // 1. Lấy danh sách items
        state.items = action.payload.cartItems || [];
        
        // 2. TỰ TÍNH TỔNG TIỀN (Frontend Calculation)
        // Công thức: Tổng = (Giá lúc thêm * Số lượng) của TẤT CẢ sản phẩm
        state.totalPrice = state.items.reduce((total, item) => {
          return total + (item.priceAtAddition * item.quantity);
        }, 0);
      })
      .addCase(fetchCart.rejected, (state) => {
        state.loading = false;
      })
      
      // Xử lý fetchTotalItems (Giữ nguyên)
      .addCase(fetchTotalItems.fulfilled, (state, action) => {
        state.totalQuantity = action.payload;
      });
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;