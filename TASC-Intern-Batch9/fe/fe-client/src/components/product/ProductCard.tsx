import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchTotalItems } from '../../store/slices/cartSlice'; // Action lấy số lượng
import cartService from '../../api/cartService'; // Service API
import { useToast } from '../../context/ToastContext';
import AsyncImage from '../common/AsyncImage';
import type { Product } from '../../types/product.types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  
  // Lấy trạng thái đăng nhập
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  // State loading cho nút thêm giỏ hàng
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Ngăn chặn chuyển trang (do card được bọc trong Link)
    e.stopPropagation();

    // 1. Kiểm tra đăng nhập
    if (!isAuthenticated) {
      toast.info("Yêu cầu đăng nhập", "Vui lòng đăng nhập để mua hàng.");
      navigate('/login');
      return;
    }

    setIsAdding(true);
    try {
      // 2. Gọi API thêm vào giỏ
      await cartService.addItemToCart({
        productId: product.id,
        quantity: 1
      });

      // 3. Cập nhật Badge trên Header
      dispatch(fetchTotalItems());
      
      toast.success('Đã thêm vào giỏ', product.title);
    } catch (error: any) {
      console.error(error);
      toast.error('Lỗi', error.response?.data?.message || 'Không thể thêm sản phẩm.');
    } finally {
      setIsAdding(false);
    }
  };

  // Tính phần trăm giảm giá (an toàn với null/undefined)
  const priceNew = product.priceNew || 0;
  const priceOld = product.priceOld || 0;
  
  const discountPercent = priceOld > priceNew 
    ? Math.round(((priceOld - priceNew) / priceOld) * 100) 
    : 0;

  return (
    <div className="group/card relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
      
      {/* Badge giảm giá */}
      {discountPercent > 0 && (
        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
          -{discountPercent}%
        </span>
      )}

      {/* Ảnh sản phẩm */}
      <Link to={`/products/${product.slug}`} className="block relative overflow-hidden aspect-square shrink-0">
        <AsyncImage 
          src={product.thumbnail} 
          alt={product.title}
          className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
        />
        
        {/* Overlay & Button */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center gap-2">
           <button 
             onClick={handleAddToCart}
             disabled={isAdding}
             className="p-2 bg-white rounded-full hover:bg-primary hover:text-white transition disabled:opacity-70 disabled:cursor-not-allowed"
             title="Thêm vào giỏ hàng"
           >
             {isAdding ? (
               <Loader2 className="w-5 h-5 animate-spin text-primary" />
             ) : (
               <ShoppingCart className="w-5 h-5" />
             )}
           </button>
        </div>
      </Link>

      {/* Thông tin sản phẩm */}
      <div className="p-4 flex flex-col flex-1">
        <div className="text-xs text-gray-500 mb-1">
            {product.brand?.name || product.productType || 'Dược phẩm'}
        </div>
        
        <Link to={`/products/${product.slug}`} className="mb-2">
          <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 hover:text-primary transition">
            {product.title}
          </h3>
        </Link>

        <div className="mt-auto">
          <div className="text-lg font-bold text-primary">
            {priceNew.toLocaleString('vi-VN')} đ
          </div>
          {priceOld > priceNew && (
            <div className="text-xs text-gray-400 line-through">
              {priceOld.toLocaleString('vi-VN')} đ
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;