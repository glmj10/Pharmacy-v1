import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Home, FileText } from 'lucide-react';
import paymentService from '../api/paymentService';

const PaymentResult: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('Đang xử lý kết quả thanh toán...');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Lấy tất cả params từ URL (vnp_Amount, vnp_ResponseCode, ...)
        const params = Object.fromEntries(searchParams.entries());
        
        // Gọi API Backend để verify (Backend sẽ check checksum)
        const res: any = await paymentService.handleVnPayReturn(params);
        
        // Giả sử backend trả về 200 OK nếu thanh toán thành công
        setStatus('success');
        setMessage(res.message || 'Thanh toán thành công!');
        
      } catch (error: any) {
        console.error(error);
        setStatus('failed');
        setMessage(error.response?.data?.message || 'Thanh toán thất bại hoặc có lỗi xảy ra.');
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
      
      {status === 'loading' && (
        <>
          <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
          <h2 className="text-xl font-semibold text-slate-700">Đang xác thực giao dịch...</h2>
          <p className="text-gray-500">Vui lòng không tắt trình duyệt.</p>
        </>
      )}

      {status === 'success' && (
        <div className="animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Thanh toán thành công!</h1>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">{message}</p>
          <div className="flex gap-4 justify-center">
            <Link to="/" className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2">
              <Home className="w-4 h-4" /> Trang chủ
            </Link>
            <Link to="/profile?tab=orders" className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Xem đơn hàng
            </Link>
          </div>
        </div>
      )}

      {status === 'failed' && (
        <div className="animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Thanh toán thất bại</h1>
          <p className="text-red-500 mb-8 max-w-md mx-auto">{message}</p>
          <div className="flex gap-4 justify-center">
            <Link to="/checkout" className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-blue-600">
              Thử lại
            </Link>
            <Link to="/" className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50">
              Về trang chủ
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentResult;