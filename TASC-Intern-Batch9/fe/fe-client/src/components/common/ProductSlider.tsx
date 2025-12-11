import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../product/ProductCard';
import type { Product } from '../../types';
import { cn } from '../../lib/utils';

interface ProductSliderProps {
  products: Product[];
  className?: string; // Để custom style container nếu cần
}

const ProductSlider: React.FC<ProductSliderProps> = ({ products, className }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Kiểm tra vị trí để ẩn/hiện nút
  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      // Dùng sai số -1 để tránh lỗi làm tròn
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Hàm cuộn
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth / 2; // Cuộn 50% chiều rộng khung nhìn
      const newScrollLeft = direction === 'left'
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });

      // Đợi animation chạy xong rồi check lại nút
      setTimeout(checkScrollButtons, 300);
    }
  };

  // Lắng nghe sự kiện scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      checkScrollButtons(); // Check ngay lần đầu

      // Check lại khi resize cửa sổ
      window.addEventListener('resize', checkScrollButtons);
    }
    return () => {
      container?.removeEventListener('scroll', checkScrollButtons);
      window.removeEventListener('resize', checkScrollButtons);
    };
  }, [products]);

  return (
    // 1. Đổi 'group' -> 'group/slider'
    <div className={cn("relative group/slider", className)}>

      {/* Nút Previous */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          // Nếu bạn muốn nút này hiện khi hover Slider, hãy dùng: group-hover/slider:opacity-100
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 -ml-4 w-10 h-10 bg-white border border-gray-100 shadow-xl rounded-full flex items-center justify-center text-gray-700 hover:text-primary hover:border-primary transition-all hidden md:flex"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Container Slider */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-4 px-1"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[180px] md:w-[220px] lg:w-[240px] flex-none h-full snap-start"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Nút Next */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 -mr-4 w-10 h-10 bg-white border border-gray-100 shadow-xl rounded-full flex items-center justify-center text-gray-700 hover:text-primary hover:border-primary transition-all hidden md:flex"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default ProductSlider;