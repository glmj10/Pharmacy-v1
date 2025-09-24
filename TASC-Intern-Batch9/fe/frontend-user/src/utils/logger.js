const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

class Logger {
  constructor() {
    this.isDev = isDevelopment;
    this.isProd = isProduction;
  }

  // Debug logs only in development
  debug(...args) {
    if (this.isDev) {
      console.log('🐛 [DEBUG]:', ...args);
    }
  }

  // Info logs in all environments except production
  info(...args) {
    if (!this.isProd) {
      console.info('ℹ️ [INFO]:', ...args);
    }
  }

  // Warning logs in all environments
  warn(...args) {
    if (this.isDev) {
      console.warn('⚠️ [WARN]:', ...args);
    }
    // In production, could send to external service
    if (this.isProd) {
      this.sendToErrorService('warn', args);
    }
  }

  // Error logs in all environments
  error(...args) {
    console.error('❌ [ERROR]:', ...args);
    
    // In production, send to external error tracking
    if (this.isProd) {
      this.sendToErrorService('error', args);
    }
  }

  // API specific error logging
  apiError(endpoint, error, context = {}) {
    const errorInfo = {
      endpoint,
      status: error?.response?.status,
      message: error?.message,
      data: error?.response?.data,
      context
    };

    this.error('API Error:', errorInfo);
    
    // Return user-friendly message
    return this.getUserFriendlyMessage(error);
  }

  // Get user-friendly error message
  getUserFriendlyMessage(error) {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;
    
    const statusMessages = {
      400: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin đã nhập',
      401: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại',
      403: 'Bạn không có quyền thực hiện thao tác này',
      404: 'Không tìm thấy thông tin yêu cầu',
      409: 'Dữ liệu đã tồn tại trong hệ thống',
      422: 'Dữ liệu không hợp lệ',
      500: 'Lỗi hệ thống. Vui lòng thử lại sau',
      502: 'Dịch vụ tạm thời không khả dụng',
      503: 'Hệ thống đang bảo trì. Vui lòng thử lại sau'
    };

    return message || statusMessages[status] || 'Đã xảy ra lỗi không xác định';
  }

  // Send to external error tracking service (Sentry, LogRocket, etc.)
  sendToErrorService(level, args) {
    // Implementation for external error tracking
    // Example: Sentry.captureException() or custom API
    try {
      // Could implement Sentry, LogRocket, or custom service here
      if (window.Sentry) {
        window.Sentry.captureException(new Error(JSON.stringify(args)));
      }
    } catch (e) {
      console.error('Failed to send error to tracking service:', e);
    }
  }

  // Performance tracking
  time(label) {
    if (this.isDev) {
      console.time(`⏱️ ${label}`);
    }
  }

  timeEnd(label) {
    if (this.isDev) {
      console.timeEnd(`⏱️ ${label}`);
    }
  }
}

// Create singleton instance
const logger = new Logger();

export default logger;

// Named exports for convenience
export const { debug, info, warn, error, apiError, time, timeEnd } = logger;