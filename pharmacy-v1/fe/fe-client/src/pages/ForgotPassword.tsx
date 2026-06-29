import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import identityService from '../api/identityService';
import { useModal } from '../context/ModalContext';
import { cn } from '../lib/utils';
import { REGEX } from '../lib/constants';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { openModal } = useModal();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>();

  const onSubmit = async (data: { email: string }) => {
    setIsLoading(true);
    try {
      await identityService.forgotPassword(data.email);
      // Thành công -> Chuyển sang trang Reset password, mang theo email
      openModal('success', 'Đã gửi mã xác thực', 'Vui lòng kiểm tra email của bạn để lấy mã OTP.');
      navigate(`/reset-password?email=${encodeURIComponent(data.email)}`);
    } catch (error: any) {
      openModal('error', 'Lỗi', error.response?.data?.message || 'Không tìm thấy email này.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <button onClick={() => navigate('/login')} className="flex items-center text-sm text-gray-500 hover:text-primary mb-6 transition">
          <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại đăng nhập
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Quên mật khẩu?</h2>
          <p className="mt-2 text-sm text-slate-600">Nhập email của bạn, chúng tôi sẽ gửi mã xác thực để đặt lại mật khẩu.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email đăng ký</label>
            <input
              {...register("email", { 
                required: "Vui lòng nhập email",
                pattern: { value: REGEX.EMAIL, message: "Email không hợp lệ" }
              })}
              className={cn("w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition", errors.email ? "border-red-300 bg-red-50" : "border-gray-300")}
              placeholder="name@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-600 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
          >
            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Gửi mã xác thực"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;