import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../api/axiosClient';
import { Product, ProductParams } from '../types/product'; // Import từ file vừa tạo
import { ApiResponse, Brand, Category, PageResponse, RateResponse } from '../types';
import categoryService from '../api/categoryService';
import { brandService } from '../api/brandService';
import productService from '../api/productService';
import rateService from '../api/rateService';

interface ProductState {
  items: Product[];
  currentProduct: Product | null; // Dùng cho trang chi tiết
  loading: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null; // <--- Đã thêm dòng này để fix lỗi
  totalPages: number;
}

interface ProductState {
  items: Product[];
  currentProduct: Product | null;
  relatedProducts: Product[];
  brands: Brand[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  reviews: RateResponse[];
}

const initialState: ProductState = {
  items: [],
  currentProduct: null,
  relatedProducts: [],
  loading: false,
  status: 'idle',
  error: null, // <--- Khởi tạo giá trị null
  totalPages: 1,
  brands: [],
  reviews: [],
  categories: []
};


// 1. Fetch List (Có tham số lọc)
export const fetchProducts = createAsyncThunk(
  'products/fetchList',
  async (params: ProductParams = {}, { rejectWithValue }) => {
    try {
      const response = await productService.getAll(params);
      return { data: response.data.data, pageIndex: params.pageIndex ?? 1 };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Lỗi tải danh sách');
    }
  }
);

export const fetchProductReviews = createAsyncThunk(
  'products/fetchReviews',
  async (productId: number, { rejectWithValue }) => {
    try {
      const response = await rateService.getRates(productId);
      return response.data.data.content;
    } catch (err: any) {
      return [];
    }
  }
);

// 2. Fetch Detail (Theo slug)
export const fetchProductDetail = createAsyncThunk(
  'products/fetchDetail',
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await productService.getDetail(slug);
      console.log(response)
      return response.data.data; // Trả về Product
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Lỗi tải chi tiết');
    }
  }
);


export const fetchBrands = createAsyncThunk(
  'products/fetchBrands',
  async (_, { rejectWithValue }) => {
    try {
      const response = await brandService.getBrands();
      return response.data.data;
    } catch (err: any) {
      console.log("❌ Lỗi load Brand:", err);
      return []; // Trả về rỗng để không crash app
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await categoryService.getProductCategories();
      return response.data.data;
    } catch (err: any) {
      console.log("❌ Lỗi load Category:", err);
      return [];
    }
  }
);

export const fetchRelatedProducts = createAsyncThunk(
  'products/fetchRelated',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await productService.getRelated(id);
      return response.data.data; // Trả về mảng Product
    } catch (err: any) {
      return [];
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    }
  },
  extraReducers: (builder) => {
    // Xử lý List
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        const { data, pageIndex } = action.payload;
        if (pageIndex && pageIndex > 1) {
          // Load more: append sản phẩm vào cuối danh sách, loại bỏ trùng lặp
          const existingIds = new Set(state.items.map((p) => p.id));
          const newItems = data.content.filter((p: Product) => !existingIds.has(p.id));
          state.items = [...state.items, ...newItems];
        } else {
          // Fresh load (tìm kiếm / lọc / refresh): thay thế toàn bộ
          state.items = data.content;
        }
        state.totalPages = data.totalPages;
      })
      .addCase(fetchProducts.rejected, (state) => {
        state.loading = false;
      });

    // Xử lý Detail
    builder
      .addCase(fetchProductDetail.pending, (state) => {
        state.loading = true;
        state.currentProduct = null;
      })
      .addCase(fetchProductDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      });

    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      state.categories = action.payload;
    });

    builder.addCase(fetchBrands.fulfilled, (state, action) => {
      state.brands = action.payload;
    });

    builder.addCase(fetchRelatedProducts.fulfilled, (state, action) => {
      state.relatedProducts = action.payload;
    });

    builder.addCase(fetchProductReviews.fulfilled, (state, action) => {
      state.reviews = action.payload;
    });
  },
});

export const { clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;