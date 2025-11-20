// Product Image Type
export interface ProductImage {
  id: number;
  imageUrl: string;
}

// Product Types
export interface Product {
  id: number;
  slug: string;
  title: string;
  description?: string;
    // Giá cả
  price?: number; // Legacy support
  priceOld?: number; // Giá gốc
  priceNew?: number; // Giá hiện tại
  discountPrice?: number; // Legacy support
  importPrice?: number; // Giá nhập
  // Hình ảnh
  thumbnailUrl?: string;
  images?: ProductImage[] | string[]; // Hỗ trợ cả 2 format
  // Phân loại
  category?: Category;
  categories?: Category[];
  brand?: Brand;
  // Số lượng và trạng thái
  quantity?: number; // Số lượng tồn kho
  stockQuantity?: number; // Legacy support
  active?: boolean;
  // Thông tin sản phẩm
  manufacturer?: string; // Nhà sản xuất
  productType?: string; // Loại sản phẩm
  noted?: string; // Ghi chú
  indication?: string; // Chỉ định
  registrationNumber?: string; // Số đăng ký
  activeIngredient?: string; // Hoạt chất
  dosageForm?: string; // Dạng bào chế
  ingredient?: string; // Legacy support
  dosage?: string;
  usage?: string;
  sideEffects?: string;
  prescriptionRequired?: boolean;
  // Thống kê
  priority?: number;
  rating?: number;
  reviewCount?: number;
  sold?: number;
  views?: number;
  likes?: number;
  numberOfLikes?: number;
  // Wishlist
  isLiked?: boolean;
  inWishlist?: boolean;
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

// Category Types
export interface TypeResponse {
  id: number;
  code: string;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  thumbnail?: string;
  description?: string;
  image?: string;
  priority?: number;
  type?: TypeResponse;
  parentId?: number;
  parent?: Category;
  children?: Category[];
  childCategories?: Category[];
  productCount?: number;
}

export interface CategoryResponse {
  data: Category[] | { data: Category[] };
  message?: string;
  success?: boolean;
}

// Brand Types
export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  website?: string;
  productCount?: number;
}

// Cart Types
export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  selected: boolean;
  priceAtAddition?: number;
  priceDifferent?: number;
  priceChangeType?: 'INCREASE' | 'DECREASE' | 'NONE';
  isOutOfStock?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Cart {
  cartItems: CartItem[];
  totalPrice: number;
}

export interface CartResponse {
  data: Cart;
  message?: string;
  success?: boolean;
}

// Order Types
export interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  shippingFee: number;
  discount: number;
  finalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  note?: string;
  address: Address;
  items: OrderItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
  discountPrice?: number;
  totalAmount: number;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPING = 'SHIPPING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
}

// User Types
export interface User {
  id: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  avatar?: string;
  profilePic?: string;
  profilePicUrl?: string;
  dateOfBirth?: string;
  gender?: string;
  isVerified?: boolean;
  role?: string;
  createdAt?: string;
}

// Address Types
export interface Address {
  id: number;
  userId: number;
  fullName: string;
  phoneNumber: string;
  address: string;
  ward?: string;
  district?: string;
  province?: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Wishlist Types
export interface WishlistItem {
  id: number;
  product: Product;
  createdAt: string;
}

// Review Types
export interface Review {
  id: number;
  user: User;
  product: Product;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
  updatedAt?: string;
}

// Notification Types
export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  data?: any;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// Wrapper cho paginated response
export interface PaginatedApiResponse<T> {
  data: PaginatedResponse<T>;
  message?: string;
  success?: boolean;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: User;
  expiresIn?: number;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

// Filter Types
export interface ProductFilter {
  pageIndex?: number;
  pageSize?: number;
  title?: string;
  category?: string;
  brand?: string;
  priceFrom?: number;
  priceTo?: number;
  isAscending?: boolean;
  sortBy?: 'price' | 'name' | 'rating' | 'createdAt';
}

// Payment Types
export interface PaymentRequest {
  orderId: number;
  amount: number;
  method: 'VNPAY' | 'MOMO' | 'COD';
  returnUrl?: string;
}

export interface PaymentResponse {
  paymentUrl?: string;
  transactionId: string;
  status: string;
  message: string;
}
