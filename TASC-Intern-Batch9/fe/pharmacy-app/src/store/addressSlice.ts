import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import addressService from '../api/addressService';
import { Address, AddressRequest } from '../types';

interface AddressState {
  items: Address[];
  loading: boolean;
  error: string | null;
}

const initialState: AddressState = {
  items: [],
  loading: false,
  error: null,
};

// 1. Fetch Addresses
export const fetchAddresses = createAsyncThunk(
  'address/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await addressService.getAll();
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// 2. Add Address
export const addAddress = createAsyncThunk(
  'address/add',
  async (data: AddressRequest, { rejectWithValue }) => {
    try {
      const response = await addressService.create(data);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const deleteAddress = createAsyncThunk(
  'address/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await addressService.delete(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const updateAddress = createAsyncThunk(
  'address/update',
  async ({ id, data }: { id: number; data: AddressRequest }, { rejectWithValue }) => {
    try {
      const response = await addressService.update(id, data);
      return response.data.data; // Trả về Address đã sửa
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Lỗi cập nhật địa chỉ');
    }
  }
);


const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch
    builder
      .addCase(fetchAddresses.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    // Add
    builder.addCase(addAddress.fulfilled, (state, action) => {
      // Nếu là mặc định, bỏ mặc định các cái cũ (logic frontend optional)
      if (action.payload.isDefault) {
        state.items.forEach(i => i.isDefault = false);
      }
      state.items.push(action.payload);
    });

    // Delete
    builder.addCase(deleteAddress.fulfilled, (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    });

    builder.addCase(updateAddress.fulfilled, (state, action) => {
      const updatedItem = action.payload;

      // Tìm và thay thế item cũ
      const index = state.items.findIndex(item => item.id === updatedItem.id);
      if (index !== -1) {
        state.items[index] = updatedItem;
      }

      // Nếu item này được set là default, bỏ default của các item khác
      if (updatedItem.isDefault) {
        state.items.forEach(item => {
          if (item.id !== updatedItem.id) item.isDefault = false;
        });
      }
    });
  },
});

export default addressSlice.reducer;