import React from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { clearAuth } from '../../store/slices/authSlice';
import { clearAuthHeader } from '../../api/axiosClient';
import identityService, { type ChangePasswordRequest } from '../../api/identityService';
import { useModal } from '../../context/ModalContext'; // <== 1. Import useModal
import { useToast } from '../../context/ToastContext'; // Vẫn giữ toast để báo lỗi hệ thống nếu cần
import { cn } from '../../lib/utils';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const { openModal } = useModal(); // <== 2. Khai báo hook
  const { toast } = useToast();     // Dùng để báo lỗi 500 nếu cần
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { 
    register, 
    handleSubmit, 
    reset, 
    watch, 
    setError,
    formState: { errors, isSubmitting } 
  } = useForm<ChangePasswordRequest>();

  const newPassword = watch('newPassword');

  React.useEffect(() => {
    if (isOpen) reset();
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: ChangePasswordRequest) => {
    try {
      await identityService.changePassword(data);
      
      // ===> SỬA ĐOẠN NÀY <===
      
      // 1. Đóng Modal nhập liệu trước để tránh bị chồng chéo
      onClose();

      // 2. Mở Modal Thông báo Thành công
      openModal(
        'success', 
        'Đổi mật khẩu thành công', 
        'Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại bằng mật khẩu mới để tiếp tục.', 
        () => {
          // 3. Callback này chạy khi người dùng bấm nút "Đóng" trên Modal
          clearAuthHeader();     // Xóa JWT khỏi memory
          dispatch(clearAuth()); // Xóa token khỏi Redux + localStorage
          navigate('/login');    // Chuyển về trang đăng nhập
        }
      );

    } catch (error: any) {
      // Logic xử lý lỗi giữ nguyên
      const errorMessage = error.response?.data?.message || 'Đổi mật khẩu thất bại.';
      const errorMsgLower = errorMessage.toLowerCase();

      if (errorMsgLower.includes("mật khẩu cũ") || errorMsgLower.includes("không chính xác") || errorMsgLower.includes("incorrect")) {
        setError("currentPassword", {
          type: "manual",
          message: errorMessage
        });
        return;
      }

      if (errorMsgLower.includes("mật khẩu mới") && errorMsgLower.includes("trùng")) {
        setError("newPassword", {
          type: "manual",
          message: errorMessage
        });
        return;
      }

      // Các lỗi khác dùng toast hoặc modal error tùy bạn
      toast.error('Lỗi', errorMessage);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" /> Đổi mật khẩu
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
           {/* ... (Phần UI input giữ nguyên như cũ) ... */}
           
           {/* Mật khẩu cũ */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu hiện tại</label>
            <input
              type="password"
              {...register('currentPassword', { required: 'Vui lòng nhập mật khẩu cũ' })}
              className={cn(
                "w-full px-4 py-2 border rounded-lg focus:ring-primary outline-none transition",
                errors.currentPassword ? "border-red-500 bg-red-50 focus:border-red-500" : "border-gray-300"
              )}
              placeholder="••••••••"
            />
            {errors.currentPassword && <p className="text-xs text-red-500 mt-1 font-medium">{errors.currentPassword.message}</p>}
          </div>

          {/* Mật khẩu mới */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu mới</label>
            <input
              type="password"
              {...register('newPassword', { 
                required: 'Vui lòng nhập mật khẩu mới',
                minLength: { value: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
              })}
              className={cn(
                "w-full px-4 py-2 border rounded-lg focus:ring-primary outline-none transition",
                errors.newPassword ? "border-red-500 bg-red-50 focus:border-red-500" : "border-gray-300"
              )}
              placeholder="••••••••"
            />
            {errors.newPassword && <p className="text-xs text-red-500 mt-1 font-medium">{errors.newPassword.message}</p>}
          </div>

          {/* Xác nhận mật khẩu mới */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              {...register('confirmPassword', { 
                required: 'Vui lòng xác nhận mật khẩu',
                validate: val => val === newPassword || 'Mật khẩu xác nhận không khớp'
              })}
              className={cn(
                "w-full px-4 py-2 border rounded-lg focus:ring-primary outline-none transition",
                errors.confirmPassword ? "border-red-500 bg-red-50 focus:border-red-500" : "border-gray-300"
              )}
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1 font-medium">{errors.confirmPassword.message}</p>}
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition">
              Hủy bỏ
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-blue-600 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-100">
              {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;