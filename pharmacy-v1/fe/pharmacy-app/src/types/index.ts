// Cấu trúc phân trang
export interface PageResponse<T> {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
  content: T[]; // Mảng dữ liệu (Ở đây là mảng Product)
}

// Cấu trúc API bọc ngoài cùng (Wrapper)
export interface ApiResponse<T> {
  timestamp: string;
  status: number;
  message: string;
  data: T;
}

export * from './auth';
export * from './brand';
export * from './voucher';
export * from './promotion';
export * from './rate';

export * from './category';
export * from './product';
export * from './rate'; 
export * from './address';
export * from './order'; 
export * from './cart';
export * from './blog';
export * from './banner';
