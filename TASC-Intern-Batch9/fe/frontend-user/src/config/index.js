/**
 * Application Configuration
 * Centralized config management for the application
 */

// Environment validation
const requiredEnvVars = ['REACT_APP_API_URL'];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.warn(`⚠️  Missing environment variable: ${envVar}`);
  }
});

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1',
  TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000,
  RETRY_ATTEMPTS: parseInt(process.env.REACT_APP_API_RETRY_ATTEMPTS) || 3,
  RETRY_DELAY: parseInt(process.env.REACT_APP_API_RETRY_DELAY) || 1000,
};

// Authentication Configuration  
export const AUTH_CONFIG = {
  TOKEN_KEY: 'token',
  USER_KEY: 'user',
  REFRESH_BUFFER_TIME: 300000, // 5 minutes before expiry
};

// UI Configuration
export const UI_CONFIG = {
  TOAST_DURATION: parseInt(process.env.REACT_APP_TOAST_DURATION) || 5000,
  PAGINATION_SIZE: parseInt(process.env.REACT_APP_PAGINATION_SIZE) || 10,
  IMAGE_MAX_SIZE: parseInt(process.env.REACT_APP_IMAGE_MAX_SIZE) || 5242880, // 5MB
};

// Feature Flags
export const FEATURES = {
  ENABLE_ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
  ENABLE_DEBUG: process.env.NODE_ENV === 'development',
  ENABLE_SERVICE_WORKER: process.env.REACT_APP_ENABLE_SW === 'true',
};

// Environment-specific settings
export const ENVIRONMENT = {
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_TEST: process.env.NODE_ENV === 'test',
};

// Export default config object
const config = {
  API: API_CONFIG,
  AUTH: AUTH_CONFIG,
  UI: UI_CONFIG,
  FEATURES,
  ENVIRONMENT,
};

export default config;