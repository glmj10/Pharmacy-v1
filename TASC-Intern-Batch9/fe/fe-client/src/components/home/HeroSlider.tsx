import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

// Dữ liệu Banner giả lập
const BANNERS = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&q=80&w=1200",
    subtitle: "Ưu đãi độc quyền",
    title: "Chăm sóc sức khỏe \nMùa giao mùa",
    btnText: "Mua ngay",
    link: "/products"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1200",
    subtitle: "Sản phẩm mới",
    title: "Vitamin tổng hợp \nCho cả gia đình",
    btnText: "Khám phá",
    link: "/categories/vitamin"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=1200",
    subtitle: "Miễn phí vận chuyển",
    title: "Đơn hàng từ 300k \nGiao nhanh 2h",
    btnText: "Đặt hàng",
    link: "/cart"
  }
];

const HeroSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);

  // Tự động chuyển slide
  useEffect(() => {
    const slideInterval = setInterval(() => {
      nextSlide();
    }, 5000); // 5 giây đổi 1 lần

    return () => clearInterval(slideInterval);
  }, [current]);

  const prevSlide = () => {
    setCurrent(current === 0 ? BANNERS.length - 1 : current - 1);
  };

  const nextSlide = () => {
    setCurrent(current === BANNERS.length - 1 ? 0 : current + 1);
  };

  const goToSlide = (index: number) => {
    setCurrent(index);
  };

  return (
    <div className="relative h-[200px] md:h-[380px] w-full overflow-hidden rounded-2xl group shadow-sm bg-gray-100">
      
      {/* 1. SLIDES CONTAINER */}
      <div 
        className="flex transition-transform duration-700 ease-out h-full"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {BANNERS.map((banner) => (
          <div key={banner.id} className="min-w-full h-full relative">
            {/* Ảnh Background */}
            <img 
              src={banner.image} 
              alt={banner.title} 
              className="w-full h-full object-cover"
            />
            
            {/* Overlay Gradient giúp chữ dễ đọc hơn */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent flex flex-col justify-center px-8 md:px-16">
              <span className="text-yellow-400 font-bold uppercase tracking-wider mb-2 text-xs md:text-sm animate-fade-in-up">
                {banner.subtitle}
              </span>
              <h2 className="text-2xl md:text-5xl font-bold text-white mb-6 leading-tight whitespace-pre-line animate-fade-in-up delay-100">
                {banner.title}
              </h2>
              <Link 
                to={banner.link}
                className="w-max bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-full font-medium transition flex items-center gap-2 animate-fade-in-up delay-200 shadow-lg"
              >
                {banner.btnText} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* 2. NAVIGATION BUTTONS (Ẩn, hiện khi hover) */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white text-white hover:text-slate-900 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white text-white hover:text-slate-900 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* 3. PAGINATION DOTS */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {BANNERS.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              current === index 
                ? "bg-white w-6" // Active dot dài hơn
                : "bg-white/50 hover:bg-white/80"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;