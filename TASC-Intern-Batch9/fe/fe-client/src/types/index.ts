// 1. Structure cho ApiResponse (Khớp với Java)
export interface ApiResponse<T> {
  timestamp: string;
  status: number;
  message: string;
  data: T; // Chú ý: Java đặt tên field này là 'data'
}

// 2. Structure cho PageResponse (Khớp với Java)
export interface PageResponse<T> {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
  content: T; // Chú ý: Java đặt tên field này là 'content'
}

// 1. User & Profile
export interface User {
  id: number;
  username: string;
  email: string;
  profilePic?: string;
  token?: string; // JWT lưu ở đây và LocalStorage
}

// 2. Product (Thuốc)



// 4. Order (Đơn hàng)
export interface Order {
  id: number;
  customer_name: string;
  customer_phone_number: string;
  customer_address: string;
  total_price: number;
  status: 'PENDING' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
  payment_method: 'COD' | 'ONLINE';
  created_at: string;
}