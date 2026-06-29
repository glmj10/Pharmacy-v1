import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, Mail, Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import identityService from '../api/identityService';
import { cn } from '../lib/utils';
import { REGEX } from '../lib/constants';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);

  const { 
    register, 
    handleSubmit, 
    watch, 
    formState: { errors } 
  } = useForm({
    mode: 'onBlur'
  });

  const passwordValue = watch("password", "");

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setApiError(null);
    
    try {
      await identityService.register({
        email: data.email,
        username: data.username,
        password: data.password,
        confirmPassword: data.confirmPassword
      });

      setSuccessEmail(data.email);
      
    } catch (error: any) {
      console.error(error);
      setApiError(error.response?.data?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">

      {successEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-9 h-9 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Đăng ký thành công!</h2>
            <p className="text-slate-600 mb-1">Chúng tôi đã gửi mã OTP đến</p>
            <p className="font-bold text-primary text-lg mb-6">{successEmail}</p>
            <p className="text-sm text-slate-500 mb-6">
              Vui lòng kiểm tra hộp thư (kể cả thư mục Spam) và nhập mã để kích hoạt tài khoản.
            </p>
            <button
              onClick={() => navigate(`/verify-account?email=${encodeURIComponent(successEmail)}`)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary text-white font-bold rounded-xl hover:bg-blue-600 transition shadow-lg shadow-blue-200"
            >
              Xác thực tài khoản ngay <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Đăng ký tài khoản</h2>
          <p className="mt-2 text-sm text-slate-600">Tạo tài khoản để mua sắm và tích điểm</p>
        </div>

        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm text-center">
            {apiError}
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
            <div className="relative">
              <Mail className={cn("absolute top-2.5 left-3 h-5 w-5", errors.email ? "text-red-400" : "text-gray-400")} />
              <input
                {...register("email", { 
                  required: "Email không được để trống",
                  pattern: { value: REGEX.EMAIL, message: "Email không đúng định dạng" }
                })}
                className={cn(
                  "w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none transition sm:text-sm", 
                  errors.email ? "border-red-300 bg-red-50 focus:border-red-500" : "border-gray-300 focus:border-primary"
                )}
                placeholder="name@example.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message as string}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tên đăng nhập *</label>
            <div className="relative">
              <User className={cn("absolute top-2.5 left-3 h-5 w-5", errors.username ? "text-red-400" : "text-gray-400")} />
              <input
                {...register("username", { 
                  required: "Tên đăng nhập không được để trống",
                  minLength: { value: 3, message: "Tên đăng nhập phải có ít nhất 3 ký tự" }
                })}
                className={cn(
                  "w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none transition sm:text-sm", 
                  errors.username ? "border-red-300 bg-red-50 focus:border-red-500" : "border-gray-300 focus:border-primary"
                )}
                placeholder="user123"
              />
            </div>
            {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username.message as string}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu *</label>
            <div className="relative">
              <Lock className={cn("absolute top-2.5 left-3 h-5 w-5", errors.password ? "text-red-400" : "text-gray-400")} />
              <input
                {...register("password", { 
                  required: "Mật khẩu không được để trống",
                  minLength: { value: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" }
                })}
                type={showPassword ? "text" : "password"}
                className={cn(
                  "w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none transition sm:text-sm", 
                  errors.password ? "border-red-300 bg-red-50 focus:border-red-500" : "border-gray-300 focus:border-primary"
                )}
                placeholder="••••••••"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute top-2.5 right-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message as string}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Xác nhận mật khẩu *</label>
            <div className="relative">
              <Lock className={cn("absolute top-2.5 left-3 h-5 w-5", errors.confirmPassword ? "text-red-400" : "text-gray-400")} />
              <input
                {...register("confirmPassword", { 
                  required: "Vui lòng nhập lại mật khẩu",
                  validate: (val: string) => val === passwordValue || "Mật khẩu xác nhận không khớp"
                })}
                type={showConfirmPassword ? "text" : "password"}
                className={cn(
                  "w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none transition sm:text-sm", 
                  errors.confirmPassword ? "border-red-300 bg-red-50 focus:border-red-500" : "border-gray-300 focus:border-primary"
                )}
                placeholder="••••••••"
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                className="absolute top-2.5 right-3 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message as string}</p>}
          </div>
          
          <div className="flex items-start mt-2">
             <input id="terms" type="checkbox" required className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
             <label htmlFor="terms" className="ml-2 block text-sm text-gray-600">
               Tôi đồng ý với <a href="#" className="text-primary hover:underline">Điều khoản dịch vụ</a> và <a href="#" className="text-primary hover:underline">Chính sách bảo mật</a>.
             </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-200 mt-6"
          >
            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Đăng ký tài khoản"}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-slate-600">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-bold text-primary hover:text-blue-500">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;