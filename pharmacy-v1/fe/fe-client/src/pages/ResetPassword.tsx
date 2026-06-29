import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { KeyRound, Loader2, Eye, EyeOff } from 'lucide-react';
import identityService from '../api/identityService';
import ResendButton from '../components/auth/ResendButton';
import { useModal } from '../context/ModalContext';
import { cn } from '../lib/utils';
import { REGEX } from '../lib/constants';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { openModal } = useModal();
  
  const emailParam = searchParams.get('email') || '';
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { email: emailParam, otp: '', password: '', confirmPassword: '' }
  });

  const password = watch('password');

  // Xử lý gửi lại OTP
  const handleResendOtp = async () => {
    if (!emailParam) return;
    try {
      await identityService.resendVerificationEmail(emailParam);
      openModal('success', 'Đã gửi lại', 'Mã xác thực mới đã được gửi đến email.');
    } catch (error: any) {
      openModal('error', 'Lỗi', error.response?.data?.message || 'Không thể gửi lại mã.');
    }
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await identityService.resetPassword(data);
      openModal('success', 'Thành công', 'Mật khẩu đã được đặt lại. Vui lòng đăng nhập.', () => {
        navigate('/login');
      });
    } catch (error: any) {
      openModal('error', 'Thất bại', error.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!emailParam) {
    return <div className="text-center p-10 text-red-500">Thiếu thông tin email. Vui lòng thực hiện lại từ trang Quên mật khẩu.</div>;
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Đặt lại mật khẩu</h2>
          <p className="mt-2 text-sm text-slate-600">
            Mã OTP đã được gửi tới <strong>{emailParam}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email (Hidden or Readonly) */}
          <input type="hidden" {...register("email")} />

          {/* OTP */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">Mã xác thực (OTP)</label>
              {/* Nút gửi lại OTP */}
              <ResendButton onResend={handleResendOtp} />
            </div>
            <input
              {...register("otp", { required: "Vui lòng nhập OTP" })}
              className={cn("w-full px-4 py-3 border rounded-xl text-center text-xl font-mono tracking-widest focus:ring-2 focus:ring-primary outline-none uppercase", errors.otp ? "border-red-300" : "border-gray-300")}
              placeholder="Enter OTP"
              maxLength={6}
            />
            {errors.otp && <p className="mt-1 text-xs text-red-500 text-center">{errors.otp.message}</p>}
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu mới</label>
            <input
              {...register("password", { 
                required: "Nhập mật khẩu mới", 
                minLength: { value: 6, message: "Tối thiểu 6 ký tự" }
              })}
              type={showPass ? "text" : "password"}
              className={cn("w-full px-4 py-3 border rounded-xl focus:ring-primary outline-none", errors.password ? "border-red-300" : "border-gray-300")}
              placeholder="••••••••"
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute top-9 right-3 text-gray-400">
              {showPass ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
            </button>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Xác nhận mật khẩu</label>
            <input
              {...register("confirmPassword", { 
                validate: val => val === password || "Mật khẩu không khớp"
              })}
              type="password"
              className={cn("w-full px-4 py-3 border rounded-xl focus:ring-primary outline-none", errors.confirmPassword ? "border-red-300" : "border-gray-300")}
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-600 transition flex items-center justify-center gap-2 shadow-lg"
          >
            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Xác nhận đổi mật khẩu"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;