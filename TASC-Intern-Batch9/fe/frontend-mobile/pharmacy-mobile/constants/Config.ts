/**
 * Application Configuration
 * Centralized config management cho mobile app
 */

// API Configuration
export const API_CONFIG = {
  // Sử dụng IP của máy tính trong mạng LAN thay vì localhost
  BASE_URL: 'http://192.168.31.49:8080/api/v1',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Authentication Configuration  
export const AUTH_CONFIG = {
  TOKEN_KEY: 'token',
  USER_KEY: 'user',
  REFRESH_TOKEN_KEY: 'refreshToken',
  REFRESH_BUFFER_TIME: 300000, // 5 minutes before expiry
};

// UI Configuration
export const UI_CONFIG = {
  PAGINATION_SIZE: 10,
  ITEMS_PER_PAGE: 12,
  IMAGE_MAX_SIZE: 5242880, // 5MB
  ANIMATION_DURATION: 300,
};

// App version
export const APP_INFO = {
  VERSION: '1.0.0',
  BUILD_NUMBER: '1',
  APP_NAME: 'Pharmacy Mobile',
};

// Feature flags
export const FEATURES = {
  ENABLE_DEBUG: __DEV__,
  ENABLE_ANALYTICS: false,
  ENABLE_PUSH_NOTIFICATIONS: true,
};
