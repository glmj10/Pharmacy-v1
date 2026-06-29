import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react'; // Đổi icon User -> Mail
import { useAppDispatch } from '../store/hooks';
import { loginSuccess, updateUser } from '../store/slices/authSlice';
import identityService from '../api/identityService';
import { cn } from '../lib/utils';
import { REGEX } from '../lib/constants'; // Import Regex Email
import { useToast } from '../context/ToastContext'; // Import


interface LoginInputs {
  email: string;    // Sửa username -> email
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { toast } = useToast(); // Khai báo

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInputs>({
    mode: 'onBlur'
  });

  const onSubmit = async (data: LoginInputs) => {
    setIsLoading(true);
    setApiError(null);
    try {
      // 1. Gọi API Login
      const res: any = await identityService.login({
        email: data.email,
        password: data.password
      });

      // 2. Xử lý kết quả
      // Backend trả về: { code: 1000, result: { token: "..." } }
      const authData = res.data || res.result;
      const token = authData.token;

      const tempUser = {
        id: 0, // ID giả
        username: data.email.split('@')[0], // Lấy tên từ email làm username tạm
        email: data.email,
        token: token
      };

      dispatch(loginSuccess({ user: tempUser, token }));
      toast.success('Đăng nhập thành công', `Chào mừng trở lại, ${tempUser.username}!`);

      // (Optional) Gọi thêm API getProfile tại đây nếu backend có hỗ trợ
      const profileRes = await identityService.getCurrentUser();
      dispatch(updateUser(profileRes.data));

      navigate('/');
    } catch (error: any) {
      console.error(error);
      setApiError(error.response?.data?.message || 'Email hoặc mật khẩu không đúng.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Đăng nhập</h2>
        </div>

        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm text-center">
            {apiError}
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>

          {/* EMAIL FIELD (Đã đổi từ Username) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className={cn("h-5 w-5", errors.email ? "text-red-400" : "text-gray-400")} />
              </div>
              <input
                {...register("email", {
                  required: "Email không được để trống",
                  pattern: { value: REGEX.EMAIL, message: "Email không đúng định dạng" }
                })}
                className={cn(
                  "appearance-none block w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none transition sm:text-sm",
                  errors.email
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
                    : "border-gray-300 focus:ring-primary focus:border-primary bg-white"
                )}
                placeholder="name@example.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>}
          </div>

          {/* PASSWORD FIELD (Giữ nguyên) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className={cn("h-5 w-5", errors.password ? "text-red-400" : "text-gray-400")} />
              </div>
              <input
                {...register("password", { required: "Mật khẩu không được để trống" })}
                type={showPassword ? "text" : "password"}
                className={cn(
                  "appearance-none block w-full pl-10 pr-10 py-2.5 border rounded-xl focus:outline-none transition sm:text-sm",
                  errors.password
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
                    : "border-gray-300 focus:ring-primary focus:border-primary bg-white"
                )}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500 font-medium">{errors.password.message}</p>}
          </div>

          {/* ... Phần Remember me và Button giữ nguyên ... */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember-me" type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">Nhớ mật khẩu</label>
            </div>

            {/* ===> 1. LINK QUÊN MẬT KHẨU <=== */}
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-primary hover:text-blue-500 hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
          </div>


          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-blue-600 transition shadow-lg shadow-blue-200"
          >
            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Đăng nhập"}
          </button>
        </form>

        <div className="space-y-4 mt-6 text-center">
          <p className="text-sm text-slate-600">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-bold text-primary hover:text-blue-500">
              Đăng ký ngay
            </Link>
          </p>

          {/* ===> 2. LINK XÁC THỰC TÀI KHOẢN (Gửi lại email) <=== */}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Tài khoản chưa kích hoạt?</p>
            <Link 
              to="/verify-account" 
              className="text-sm font-medium text-slate-600 hover:text-primary flex items-center justify-center gap-1 transition"
            >
              Xác thực tài khoản ngay &rarr;
            </Link>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default Login;