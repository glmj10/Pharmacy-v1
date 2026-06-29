import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Order, OrderDetail, OrderRequest } from '../types';
import { fetchCart } from './cartSlice';
import orderService from '../api/orderService';

// 1. Định nghĩa Interface State rõ ràng
interface OrderState {
  loading: boolean;
  error: string | null;
  currentOrderId: number | null;
  paymentUrl: string | null;
  orderList: Order[];
  totalPages: number;
  currentOrderItems: OrderDetail[];
}

// 2. Initial State
const initialState: OrderState = {
  loading: false,
  error: null,
  currentOrderId: null,
  paymentUrl: null,
  orderList: [],
  totalPages: 1,
  currentOrderItems: [],
};


export const fetchOrderDetail = createAsyncThunk(
  'orders/fetchDetail',
  async (orderId: number, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrderDetail(orderId);
      console.log("Fetched Order Detail:", response.data.data);
      return response.data.data; // Trả về OrderDetail[]
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancel',
  async (orderId: number, { dispatch, rejectWithValue }) => {
    try {
      await orderService.cancelOrder(orderId);
      return orderId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Không thể hủy đơn hàng');
    }
  }
);


export const createOrder = createAsyncThunk(
  'orders/create',
  async (data: OrderRequest, { dispatch, rejectWithValue }) => {
    try {
      const response = await orderService.createOrder(data);
      dispatch(fetchCart()); 
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Đặt hàng thất bại');
    }
  }
);

export const fetchMyOrders = createAsyncThunk(
  'orders/fetchMyOrders',
  async (params: { pageIndex: number; status?: string }, { rejectWithValue }) => {
    try {
      const response = await orderService.getMyOrders(params.pageIndex, params.status);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// --- SLICE ---
const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    // Reset state khi đặt hàng xong hoặc thoát
    resetOrderState: (state: OrderState) => {
      state.loading = false;
      state.error = null;
      state.currentOrderId = null;
      state.paymentUrl = null;
    },

    // Xóa danh sách đơn hàng (Dùng khi đổi tab status hoặc refresh)
    clearOrderList: (state: OrderState) => {
      state.orderList = [];
    },

    // Xóa chi tiết đơn hàng hiện tại (Dùng khi unmount trang detail)
    clearCurrentOrder: (state: OrderState) => {
      state.currentOrderItems = [];
    } 
  },
  extraReducers: (builder) => {
    // Xử lý Create Order
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrderId = action.payload.orderId;
        state.paymentUrl = action.payload.paymentUrl || null;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Xử lý Fetch My Orders
    builder.addCase(fetchMyOrders.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchMyOrders.fulfilled, (state, action) => {
      state.loading = false;
      // Nếu là trang 1 -> Ghi đè, Trang > 1 -> Nối thêm
      if (action.meta.arg.pageIndex === 1) {
        state.orderList = action.payload.content;
      } else {
        state.orderList = [...state.orderList, ...action.payload.content];
      }
      state.totalPages = action.payload.totalPages;
    });
    builder.addCase(fetchMyOrders.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(fetchOrderDetail.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchOrderDetail.fulfilled, (state, action) => {
      state.loading = false;
      state.currentOrderItems = action.payload;
    });

    // XỬ LÝ CANCEL ORDER
    builder.addCase(cancelOrder.fulfilled, (state, action) => {
      state.loading = false;
      // Cập nhật trạng thái trong list (Optimistic update)
      const order = state.orderList.find(o => o.id === action.payload);
      if (order) order.status = 'CANCELLED';
    });
  },
});

// Export Actions
export const { resetOrderState, clearOrderList, clearCurrentOrder } = orderSlice.actions;

export default orderSlice.reducer;