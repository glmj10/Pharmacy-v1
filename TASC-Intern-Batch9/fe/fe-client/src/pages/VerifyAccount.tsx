import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, Loader2, Mail, ArrowLeft } from 'lucide-react';
import identityService from '../api/identityService';
import ResendButton from '../components/auth/ResendButton';
import { useModal } from '../context/ModalContext';
import { cn } from '../lib/utils';
import { REGEX } from '../lib/constants';

const VerifyAccount: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { openModal } = useModal();
  const [isLoading, setIsLoading] = useState(false);

  // Lấy email từ URL nếu có (ví dụ: /verify-account?email=abc@gmail.com)
  const defaultEmail = searchParams.get('email') || '';

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { email: defaultEmail, otp: '' }
  });

  const emailValue = watch('email');

  // Xử lý Gửi lại Email xác thực
  const handleResend = async () => {
    if (!emailValue || !REGEX.EMAIL.test(emailValue)) {
      openModal('error', 'Lỗi', 'Vui lòng nhập đúng định dạng email trước khi gửi lại mã.');
      return;
    }
    try {
      await identityService.resendVerificationEmail(emailValue);
      openModal('success', 'Đã gửi', `Mã xác thực mới đã được gửi tới ${emailValue}`);
    } catch (error: any) {
      openModal('error', 'Thất bại', error.response?.data?.message || 'Không thể gửi lại mã.');
    }
  };

  // Xử lý Xác thực (Submit Form)
  const onSubmit = async (data: { email: string; otp: string }) => {
    setIsLoading(true);
    try {
      await identityService.verifyAccount(data);
      openModal('success', 'Xác thực thành công', 'Tài khoản của bạn đã được kích hoạt. Vui lòng đăng nhập.', () => {
        navigate('/login');
      });
    } catch (error: any) {
      openModal('error', 'Xác thực thất bại', error.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
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
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Xác thực tài khoản</h2>
          <p className="mt-2 text-sm text-slate-600">Nhập mã OTP đã được gửi đến email của bạn để kích hoạt tài khoản.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Input Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
              <input
                {...register("email", { 
                  required: "Vui lòng nhập email",
                  pattern: { value: REGEX.EMAIL, message: "Email không hợp lệ" }
                })}
                className={cn(
                  "w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none transition", 
                  errors.email ? "border-red-300" : "border-gray-300 focus:border-primary"
                )}
                placeholder="name@example.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          {/* Input OTP */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-slate-700">Mã OTP</label>
              {/* Nút gửi lại OTP */}
              <ResendButton onResend={handleResend} />
            </div>
            <input
              {...register("otp", { required: "Vui lòng nhập mã OTP" })}
              className={cn(
                "w-full px-4 py-3 border rounded-xl text-center text-xl font-mono tracking-widest focus:ring-2 focus:ring-primary outline-none uppercase transition",
                errors.otp ? "border-red-300" : "border-gray-300"
              )}
              placeholder="Enter OTP"
              maxLength={6}
            />
            {errors.otp && <p className="mt-1 text-xs text-red-500 text-center">{errors.otp.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-600 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
          >
            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Xác thực ngay"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyAccount;