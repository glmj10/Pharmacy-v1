import logger from './logger';
import { toast } from 'react-toastify';

class ErrorHandler {
  constructor() {
    this.setupGlobalErrorHandlers();
  }

  // Setup global error handlers
  setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      logger.error('Unhandled Promise Rejection:', event.reason);
      event.preventDefault();
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      logger.error('JavaScript Error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });
  }

  // Handle API errors with toast notification
  handleApiError(error, context = {}, showToast = true) {
    const userMessage = logger.apiError(context.endpoint || 'unknown', error, context);
    
    if (showToast) {
      // Don't show toast for certain errors
      const silentErrors = [401]; // Token refresh errors
      const shouldShowToast = !silentErrors.includes(error?.response?.status);
      
      if (shouldShowToast) {
        toast.error(userMessage);
      }
    }
    
    return userMessage;
  }

  // Handle form validation errors
  handleValidationErrors(error) {
    const validationErrors = {};
    
    if (error?.response?.data?.details?.validation_errors && 
        Array.isArray(error.response.data.details.validation_errors)) {
      
      error.response.data.details.validation_errors.forEach(detail => {
        if (detail.field && detail.message) {
          if (!validationErrors[detail.field]) {
            validationErrors[detail.field] = [];
          }
          validationErrors[detail.field].push(detail.message);
        }
      });
    }
    
    return validationErrors;
  }

  // Handle component errors
  handleComponentError(error, errorInfo, componentName) {
    logger.error(`Component Error in ${componentName}:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });

    // Clear potentially corrupted data
    if (error.message && error.message.includes('JSON')) {
      try {
        localStorage.removeItem('token');
        logger.info('Cleared corrupted token from localStorage');
      } catch (e) {
        logger.error('Failed to clear localStorage:', e);
      }
    }
  }

  // Handle network errors
  handleNetworkError(error, context = {}) {
    const isOffline = !navigator.onLine;
    
    if (isOffline) {
      const message = 'Không có kết nối internet. Vui lòng kiểm tra lại kết nối.';
      toast.error(message);
      return message;
    }
    
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      const message = 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.';
      toast.error(message);
      return message;
    }
    
    return this.handleApiError(error, context);
  }

  handleTimeoutError(error, context = {}) {
    const message = 'Yêu cầu quá thời gian chờ. Vui lòng thử lại.';
    logger.warn('Request timeout:', context);
    toast.warning(message);
    return message;
  }

  handleAbortError(error, context = {}) {
    logger.debug('Request aborted:', context);
    return 'Request was cancelled';
  }

  handle(error, context = {}) {
    if (error.name === 'AbortError' || context.aborted) {
      return this.handleAbortError(error, context);
    }

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return this.handleTimeoutError(error, context);
    }

    if (!error.response) {
      return this.handleNetworkError(error, context);
    }

    return this.handleApiError(error, context);
  }
}

const errorHandler = new ErrorHandler();

export default errorHandler;

export const { 
  handle, 
  handleApiError, 
  handleValidationErrors,
  handleComponentError,
  handleNetworkError 
} = errorHandler;