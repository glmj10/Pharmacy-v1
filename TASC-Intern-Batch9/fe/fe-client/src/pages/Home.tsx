import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ShieldCheck, Truck, Phone, Zap, Upload,
  ChevronRight, Heart, Activity, Thermometer, Baby, Pill,
  Ticket
} from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import HeroSlider from '../components/home/HeroSlider'; // <== Import HeroSlider
import ProductSlider from '../components/common/ProductSlider'; // <== IMPORT MỚI
import PromotionSection from '../components/home/PromotionSection';
import type { Product } from '../types/product.types';


// --- MOCK DATA (Dữ liệu giả lập) ---
const CATEGORIES = [
  { id: 1, name: "Thuốc không kê đơn", icon: <Pill className="text-blue-500" />, bg: "bg-blue-100" },
  { id: 2, name: "Thực phẩm chức năng", icon: <Activity className="text-green-500" />, bg: "bg-green-100" },
  { id: 3, name: "Chăm sóc cá nhân", icon: <Heart className="text-pink-500" />, bg: "bg-pink-100" },
  { id: 4, name: "Mẹ và Bé", icon: <Baby className="text-orange-500" />, bg: "bg-orange-100" },
  { id: 5, name: "Thiết bị y tế", icon: <Thermometer className="text-teal-500" />, bg: "bg-teal-100" },
  { id: 6, name: "Tủ thuốc gia đình", icon: <ShieldCheck className="text-purple-500" />, bg: "bg-purple-100" },
];

const ARTICLES = [
  {
    id: 1,
    title: "5 cách tăng cường hệ miễn dịch vào mùa lạnh",
    image: "https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&q=80&w=400",
    cat: "Sống khỏe",
    date: "20/10/2023"
  },
  {
    id: 2,
    title: "Phân biệt cảm cúm và cảm lạnh thông thường",
    image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&q=80&w=400",
    cat: "Bệnh thường gặp",
    date: "18/10/2023"
  },
  {
    id: 3,
    title: "Review top 3 máy đo huyết áp tốt nhất 2024",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=400",
    cat: "Thiết bị y tế",
    date: "15/10/2023"
  }
];

// Tạo list sản phẩm giả (Nhân bản lên để test scroll)
const MOCK_PRODUCT_ITEM: Product = {
  id: 1,
  title: "Viên uống Vitamin C 500mg tăng cường đề kháng (Hộp 100 viên)",
  priceNew: 120000,
  priceOld: 150000,
  thumbnail: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400",
  slug: "vitamin-c-500mg",
  quantity: 100,
  description: "Mô tả...",
  active: true
};

const FLASH_SALE_PRODUCTS = Array(8).fill(MOCK_PRODUCT_ITEM).map((item, index) => ({
  ...item,
  id: index + 100,
  price_new: 99000,
  title: `[Flash Sale] ${item.title}`
}));


const FUNCTIONAL_FOODS = Array(8).fill(MOCK_PRODUCT_ITEM).map((item, index) => ({
  ...item, id: index + 200, title: `Thực phẩm chức năng ${index + 1}`
}));

// --- COMPONENT CHÍNH ---
const Home: React.FC = () => {
  return (
    <div className="space-y-10 pb-10 bg-slate-50">

      {/* 1. HERO SECTION */}
      <section className="bg-white pt-4 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            <div className="lg:col-span-2">
              <HeroSlider />
            </div>

            <div className="hidden lg:flex flex-col gap-4">
              <div className="flex-1 rounded-2xl overflow-hidden relative shadow-sm group cursor-pointer">
                <img src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="Sub 1" />
                <div className="absolute inset-0 bg-black/20 hover:bg-transparent transition p-6 flex flex-col justify-end">
                  <p className="text-white font-bold text-lg">Vitamin & Khoáng chất</p>
                  <span className="text-white/80 text-sm">Giảm đến 30%</span>
                </div>
              </div>
              <div className="flex-1 rounded-2xl overflow-hidden relative shadow-sm group cursor-pointer">
                <img src="https://images.unsplash.com/photo-1550572017-edd951aa8f72?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="Sub 2" />
                <div className="absolute inset-0 bg-black/20 hover:bg-transparent transition p-6 flex flex-col justify-end">
                  <p className="text-white font-bold text-lg">Chăm sóc cá nhân</p>
                  <span className="text-white/80 text-sm">Mua 1 tặng 1</span>
                </div>
              </div>
            </div>
          </div>

          {/* ... (Phần Features / Policy giữ nguyên) ... */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { icon: ShieldCheck, title: "Thuốc chính hãng", desc: "Đạt chuẩn GPP" },
              { icon: Truck, title: "Giao nhanh 2h", desc: "Miễn phí đơn từ 300k" },
              { icon: Phone, title: "Dược sĩ tư vấn", desc: "Hỗ trợ 24/7" },
              { icon: Zap, title: "Đổi trả 30 ngày", desc: "Thủ tục đơn giản" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                <item.icon className="w-8 h-8 text-primary" />
                <div>
                  <h4 className="font-bold text-gray-800 text-sm md:text-base">{item.title}</h4>
                  <p className="text-xs text-gray-500 hidden md:block">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      <PromotionSection />

      <section className="container mx-auto px-4 text-center my-8">
        <Link to="/vouchers" className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 text-white rounded-full font-bold shadow-lg hover:bg-orange-600 transition hover:-translate-y-1">
          <Ticket className="w-6 h-6" /> Săn thêm Voucher
        </Link>
      </section>
      
      {/* 2. CATEGORY QUICK LINKS */}
      <section className="container mx-auto px-4">
        <h3 className="font-bold text-lg text-slate-800 mb-6">Danh mục nổi bật</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <Link to="#" key={cat.id} className="flex flex-col items-center gap-3 group">
              <div className={`w-16 h-16 ${cat.bg} rounded-full flex items-center justify-center group-hover:scale-110 transition shadow-sm`}>
                {cat.icon}
              </div>
              <span className="text-sm font-medium text-center text-gray-700 group-hover:text-primary">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. BANNER UPLOAD PRESCRIPTION (Mua thuốc theo đơn) */}
      <section className="container mx-auto px-4">
        <div className="bg-blue-600 rounded-2xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-lg">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

          <div className="flex-1 relative z-10 text-white text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Bạn có đơn thuốc từ bác sĩ?</h2>
            <p className="text-blue-100 mb-6 max-w-lg">
              Chỉ cần chụp ảnh đơn thuốc và tải lên. Dược sĩ chuyên môn của chúng tôi sẽ gọi lại tư vấn và báo giá ngay cho bạn.
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition shadow-lg inline-flex items-center gap-2">
              <Upload className="w-5 h-5" /> Tải lên đơn thuốc
            </button>
          </div>
          <div className="w-full md:w-1/3 relative z-10 flex justify-center">
            {/* Minh họa đơn thuốc */}
            <div className="w-48 h-60 bg-white rotate-3 shadow-2xl rounded-lg p-4 flex flex-col gap-2 opacity-90">
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
              <div className="h-2 w-full bg-gray-100 rounded mt-2"></div>
              <div className="h-2 w-full bg-gray-100 rounded"></div>
              <div className="h-2 w-2/3 bg-gray-100 rounded"></div>
              <div className="flex-1 border-t border-dashed border-gray-300 mt-2 pt-2 space-y-2">
                <div className="h-2 w-full bg-blue-50 rounded"></div>
                <div className="h-2 w-full bg-blue-50 rounded"></div>
                <div className="h-2 w-full bg-blue-50 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FUNCTIONAL FOODS (CẬP NHẬT DÙNG PRODUCT SLIDER) */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-900 border-l-4 border-green-500 pl-3">
            Thực phẩm chức năng
          </h2>
          <Link to="#" className="text-primary hover:underline text-sm flex items-center gap-1">
            Xem thêm <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* SỬ DỤNG COMPONENT SLIDER MỚI TẠI ĐÂY */}
        <ProductSlider products={FUNCTIONAL_FOODS} />

      </section>

      {/* 6. HEALTH ARTICLES */}
      <section className="bg-white py-12 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Góc sức khỏe</h2>
            <p className="text-gray-500">Thông tin y khoa chính thống từ đội ngũ chuyên gia</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {ARTICLES.map(article => (
              <div key={article.id} className="group cursor-pointer">
                <div className="overflow-hidden rounded-xl mb-4 aspect-video relative">
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  <span className="absolute top-3 left-3 bg-white/90 text-primary text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    {article.cat}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                  <span>{article.date}</span> • <span>Bởi Dược sĩ A</span>
                </div>
                <h3 className="font-bold text-lg text-slate-900 leading-snug group-hover:text-primary transition">
                  {article.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. BRANDS (Optional) */}
      <section className="container mx-auto px-4 pb-8">
        <h3 className="font-bold text-gray-400 uppercase text-xs tracking-widest text-center mb-6">Đối tác chính hãng</h3>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale">
          {['Pfizer', 'Sanofi', 'GSK', 'Novartis', 'Rohto'].map((brand, i) => (
            <span key={i} className="text-xl font-black text-slate-900">{brand}</span>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;