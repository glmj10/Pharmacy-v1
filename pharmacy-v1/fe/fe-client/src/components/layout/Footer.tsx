import React from 'react';
import { Facebook, Instagram, Phone, Mail, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-200 pt-10 pb-6">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Cột 1: Thông tin chung */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Pharmacy Online</h3>
          <p className="text-sm text-slate-400 mb-4">
            Hệ thống nhà thuốc đạt chuẩn GPP. Chuyên cung cấp thuốc, thực phẩm chức năng chính hãng.
          </p>
          <div className="flex space-x-4">
            <Facebook className="w-5 h-5 cursor-pointer hover:text-blue-500" />
            <Instagram className="w-5 h-5 cursor-pointer hover:text-pink-500" />
          </div>
        </div>

        {/* Cột 2: Liên kết nhanh */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Về chúng tôi</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-primary transition">Giới thiệu</a></li>
            <li><a href="#" className="hover:text-primary transition">Hệ thống cửa hàng</a></li>
            <li><a href="#" className="hover:text-primary transition">Giấy phép kinh doanh</a></li>
            <li><a href="#" className="hover:text-primary transition">Chính sách bảo mật</a></li>
          </ul>
        </div>

        {/* Cột 3: Danh mục */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Danh mục</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-primary transition">Thuốc không kê đơn</a></li>
            <li><a href="#" className="hover:text-primary transition">Thực phẩm chức năng</a></li>
            <li><a href="#" className="hover:text-primary transition">Chăm sóc cá nhân</a></li>
            <li><a href="#" className="hover:text-primary transition">Thiết bị y tế</a></li>
          </ul>
        </div>

        {/* Cột 4: Liên hệ */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Liên hệ</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary shrink-0" />
              <span>123 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-primary shrink-0" />
              <span>1900 123 456</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary shrink-0" />
              <span>hotro@pharmacy.com</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="border-t border-slate-800 mt-8 pt-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Pharmacy Online. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;