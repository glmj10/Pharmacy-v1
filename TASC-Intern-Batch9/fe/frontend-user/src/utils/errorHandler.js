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

  handleComponentError(error, errorInfo, componentName) {
    logger.error(`Component Error in ${componentName}:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });

    if (error.message && error.message.includes('JSON')) {
      try {
        localStorage.removeItem('token');
        logger.info('Cleared corrupted token from localStorage');
      } catch (e) {
        logger.error('Failed to clear localStorage:', e);
      }
    }
  }

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

  handleVerificationEmailError(error) {
    let errorMessage = 'Gửi email xác thực thất bại';
    let suggestion = '';
        
    if (error.response) {
      const status = error.response.status;
      const serverMessage = error.response.data?.message || '';
            
      switch (status) {
        case 400:
          const lowerMessage = serverMessage.toLowerCase();
          
          if (lowerMessage.includes('already verified') || 
              lowerMessage.includes('đã được xác thực') ||
              lowerMessage.includes('da duoc xac thuc') ||
              lowerMessage.includes('verified') ||
              lowerMessage.includes('xác thực')) {
            errorMessage = 'Tài khoản đã được xác thực';
            suggestion = ' Bạn có thể đăng nhập ngay bây giờ.';
          } 
          else if (lowerMessage.includes('not found') || 
                   lowerMessage.includes('không tồn tại') ||
                   lowerMessage.includes('khong ton tai')) {
            errorMessage = 'Email không tồn tại trong hệ thống';
            suggestion = ' Vui lòng kiểm tra lại email hoặc đăng ký tài khoản mới.';
          } 
          else if (lowerMessage.includes('invalid email') ||
                   lowerMessage.includes('email không hợp lệ') ||
                   lowerMessage.includes('email khong hop le')) {
            errorMessage = 'Định dạng email không hợp lệ';
            suggestion = ' Vui lòng nhập đúng định dạng email (ví dụ: user@example.com).';
          } 
          else if (lowerMessage.includes('rate limit') || 
                   lowerMessage.includes('too many requests') ||
                   lowerMessage.includes('quá nhiều yêu cầu') ||
                   lowerMessage.includes('qua nhieu yeu cau')) {
            errorMessage = 'Bạn đã gửi quá nhiều yêu cầu';
            suggestion = ' Vui lòng đợi 5 phút trước khi thử lại.';
          } 
          else if (lowerMessage.includes('email not verified') ||
                   lowerMessage.includes('chưa được xác thực') ||
                   lowerMessage.includes('chua duoc xac thuc')) {
            errorMessage = 'Email chưa được xác thực';
            suggestion = ' Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.';
          } 
          else if (serverMessage.trim()) {
            errorMessage = serverMessage;
            if (lowerMessage.includes('xác thực') || lowerMessage.includes('verified')) {
              suggestion = ' Bạn có thể đăng nhập ngay bây giờ.';
            } else {
              suggestion = ' Vui lòng thử lại hoặc liên hệ hỗ trợ.';
            }
          } 
          else {
            errorMessage = 'Yêu cầu không hợp lệ';
            suggestion = ' Vui lòng kiểm tra lại thông tin và thử lại.';
          }
          break;
        case 404:
          errorMessage = 'Email không tồn tại trong hệ thống';
          suggestion = ' Vui lòng kiểm tra lại email hoặc đăng ký tài khoản mới.';
          break;
        case 409:
          errorMessage = 'Tài khoản đã được xác thực rồi';
          suggestion = ' Bạn có thể đăng nhập ngay bây giờ.';
          break;
        case 429:
          // Too many requests
          errorMessage = 'Bạn đã gửi quá nhiều yêu cầu';
          suggestion = ' Vui lòng đợi 5 phút trước khi thử lại.';
          break;
        case 500:
          // Server error
          errorMessage = 'Lỗi máy chủ';
          suggestion = ' Vui lòng thử lại sau vài phút.';
          break;
        case 503:
          // Service unavailable
          errorMessage = 'Dịch vụ email tạm thời không khả dụng';
          suggestion = ' Vui lòng thử lại sau.';
          break;
        default:
          errorMessage = serverMessage || `Lỗi ${status}: Không thể gửi email xác thực`;
          suggestion = ' Vui lòng thử lại hoặc liên hệ hỗ trợ.';
      }
    } else if (error.request) {
      errorMessage = 'Không thể kết nối đến máy chủ';
      suggestion = ' Vui lòng kiểm tra kết nối mạng và thử lại.';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Yêu cầu quá thời gian chờ';
      suggestion = ' Vui lòng thử lại với kết nối mạng ổn định hơn.';
    }
    
    logger.error('Verification email error:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      originalError: error.message
    });
    
    return errorMessage + suggestion;
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
  handleNetworkError,
  handleVerificationEmailError
} = errorHandler;