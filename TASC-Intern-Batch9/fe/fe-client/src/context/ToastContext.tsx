import React, { createContext, useContext, useState, type ReactNode, useCallback } from 'react';
import { CheckCircle, AlertCircle, X, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message: string;
}

interface ToastContextType {
  toast: {
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Hàm thêm thông báo
  const addToast = useCallback((type: ToastType, title: string, message: string = '') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, title, message }]);

    // Tự động xóa sau 3 giây
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, []);

  // Hàm xóa thông báo
  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Helper functions
  const toastHelpers = {
    success: (title: string, message?: string) => addToast('success', title, message || ''),
    error: (title: string, message?: string) => addToast('error', title, message || ''),
    info: (title: string, message?: string) => addToast('info', title, message || ''),
    warning: (title: string, message?: string) => addToast('warning', title, message || ''),
  };

  return (
    <ToastContext.Provider value={{ toast: toastHelpers }}>
      {children}
      
      {/* KHUVỰC HIỂN THỊ TOAST (Fixed góc trên phải) */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border transition-all duration-300 animate-slide-in-right",
              "bg-white backdrop-blur-md bg-opacity-95", // Nền trắng mờ
              t.type === 'success' && "border-green-200 shadow-green-100",
              t.type === 'error' && "border-red-200 shadow-red-100",
              t.type === 'warning' && "border-yellow-200 shadow-yellow-100",
              t.type === 'info' && "border-blue-200 shadow-blue-100",
            )}
          >
            {/* Icon */}
            <div className="shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
              {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className={cn("font-semibold text-sm", 
                 t.type === 'success' ? "text-green-700" : 
                 t.type === 'error' ? "text-red-700" : "text-gray-800"
              )}>
                {t.title}
              </h4>
              {t.message && <p className="text-sm text-gray-500 mt-1 leading-tight">{t.message}</p>}
            </div>

            {/* Close Button */}
            <button 
              onClick={() => removeToast(t.id)}
              className="shrink-0 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};