import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import AsyncImage from '../common/AsyncImage';
import type { Banner } from '../../types/banner.type';

interface HeroSliderProps {
  banners: Banner[];
}

const HeroSlider: React.FC<HeroSliderProps> = ({ banners }) => {
  const [current, setCurrent] = useState(0);

  // 1. Loading / Empty State
  if (!banners || banners.length === 0) {
    return (
      <div className="relative h-[200px] md:h-[380px] w-full overflow-hidden rounded-2xl bg-gray-100 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-10 w-10 bg-gray-200 rounded-full mb-2"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // 2. Auto Play Logic
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrent((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 5000); // 5 giây chuyển 1 lần

    return () => clearInterval(slideInterval);
  }, [banners.length]);

  // 3. Handlers
  const prevSlide = () => setCurrent(current === 0 ? banners.length - 1 : current - 1);
  const nextSlide = () => setCurrent(current === banners.length - 1 ? 0 : current + 1);
  const goToSlide = (index: number) => setCurrent(index);

  return (
    <div className="relative h-[200px] md:h-[380px] w-full overflow-hidden rounded-2xl group shadow-md bg-gray-50">
      
      {/* SLIDES CONTAINER */}
      <div 
        className="flex transition-transform duration-700 ease-out h-full"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="min-w-full h-full relative">
            
            {/* Ảnh Banner */}
            <AsyncImage 
              src={banner.imageUrl} 
              alt={banner.name}
              className="w-full h-full object-cover"
            />
            
            {/* Lớp phủ nội dung (Overlay) */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent flex flex-col justify-center px-8 md:px-16">
              
              <h2 className="text-2xl md:text-5xl font-bold text-white mb-6 leading-tight max-w-lg drop-shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
                {banner.name}
              </h2>
              
              {/* Nút Xem ngay (Chỉ hiện nếu có targetUrl) */}
              {banner.targetUrl && (
                <Link 
                  to={banner.targetUrl}
                  className="w-max bg-white text-slate-900 hover:bg-blue-50 px-6 py-3 rounded-full font-bold transition flex items-center gap-2 shadow-lg text-sm md:text-base animate-in fade-in zoom-in duration-700 delay-100"
                >
                  Xem ngay <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* NAVIGATION ARROWS (Chỉ hiện khi có > 1 slide) */}
      {banners.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white text-white hover:text-slate-900 backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white text-white hover:text-slate-900 backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* DOTS PAGINATION */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  current === index 
                    ? "bg-white w-8" 
                    : "bg-white/50 hover:bg-white/80 w-2"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HeroSlider;