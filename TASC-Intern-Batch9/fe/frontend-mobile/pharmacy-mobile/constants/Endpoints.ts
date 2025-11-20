/**
 * API Endpoints Configuration
 * Centralized endpoints cho tất cả API calls
 */

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_ACCOUNT: '/auth/verify-account',
    RESEND_VERIFICATION: '/auth/resend-verification',
  },

  // User endpoints
  USER: {
    ME: '/users/me',
    UPDATE_PROFILE: '/users/me',
    CHANGE_PASSWORD: '/users/me/change-password',
    UPLOAD_AVATAR: '/users/me/avatar',
  },

  // Product endpoints
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (slug: string) => `/products/slug/${slug}`,
    TOP_15_LIKES: '/products/rank/suggestions/top15',
    BY_BRAND: (brandId: number) => `/products/brand/${brandId}/top15`,
    SEARCH: '/products',
  },

  // Category endpoints
  CATEGORIES: {
    LIST: '/categories',
    DETAIL: (id: number) => `/categories/${id}`,
    BY_PARENT: (parentSlug: string) => `/categories/parent/${parentSlug}`,
  },

  // Brand endpoints
  BRANDS: {
    LIST: '/brands/customer/public',
    DETAIL: (id: number) => `/brands/${id}`,
    BY_SLUG: (slug: string) => `/brands/slug/${slug}`,
  },

  // Cart endpoints
  CART: {
    LIST: '/carts',
    ADD: '/carts',
    TOTAL_ITEMS: '/carts/item/totalItems',
    UPDATE_ITEM: (itemId: number) => `/carts/item/${itemId}`,
    REMOVE_ITEM: (itemId: number) => `/carts/item/${itemId}`,
    UPDATE_STATUS: (itemId: number) => `/carts/item/status/${itemId}`,
    UPDATE_ALL_STATUS: '/carts/item/status/all',
    CHECKOUT_ITEMS: '/carts/item/checkout',
    CLEAR: '/carts',
  },

  // Order endpoints
  ORDERS: {
    LIST: '/orders',
    DETAIL: (orderId: number) => `/orders/${orderId}`,
    CREATE: '/orders',
    CANCEL: (orderId: number) => `/orders/${orderId}/cancel`,
    CONFIRM_RECEIVED: (orderId: number) => `/orders/${orderId}/confirm-received`,
  },

  // Address endpoints
  ADDRESSES: {
    LIST: '/addresses',
    DEFAULT: '/addresses/default',
    CREATE: '/addresses',
    UPDATE: (addressId: number) => `/addresses/${addressId}`,
    DELETE: (addressId: number) => `/addresses/${addressId}`,
    SET_DEFAULT: (addressId: number) => `/addresses/${addressId}/set-default`,
  },

  // Wishlist endpoints
  WISHLIST: {
    LIST: '/wishlists',
    ADD: '/wishlists',
    REMOVE: (productId: number) => `/wishlists/${productId}`,
    CHECK: (productId: number) => `/wishlists/check/${productId}`,
    CLEAR: '/wishlists',
  },

  // Payment endpoints
  PAYMENT: {
    VNPAY_CREATE: '/payments/vnpay/create',
    VNPAY_RETURN: '/payments/vnpay/return',
    MOMO_CREATE: '/payments/momo/create',
    MOMO_RETURN: '/payments/momo/return',
  },

  // Review endpoints
  REVIEWS: {
    BY_PRODUCT: (productId: number) => `/reviews/product/${productId}`,
    CREATE: '/reviews',
    UPDATE: (reviewId: number) => `/reviews/${reviewId}`,
    DELETE: (reviewId: number) => `/reviews/${reviewId}`,
  },

  // Notification endpoints
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (notificationId: number) => `/notifications/${notificationId}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    DELETE: (notificationId: number) => `/notifications/${notificationId}`,
  },
};
