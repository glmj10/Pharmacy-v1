import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Home, ShoppingBag } from 'lucide-react';

const OrderSuccess: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Đặt hàng thành công!</h1>
      <p className="text-gray-500 mb-8 max-w-md">
        Cảm ơn bạn đã tin tưởng Pharmacy. Đơn hàng của bạn đang được xử lý và sẽ giao đến tay bạn sớm nhất.
      </p>

      <div className="flex gap-4">
        <Link 
          to="/" 
          className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition flex items-center gap-2"
        >
          <Home className="w-4 h-4" /> Về trang chủ
        </Link>
        <Link 
          to="/profile" 
          className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 transition shadow-lg flex items-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" /> Xem đơn hàng
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;