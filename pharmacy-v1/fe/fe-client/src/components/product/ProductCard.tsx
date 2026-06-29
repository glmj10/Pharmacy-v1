import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Loader2, Heart } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchTotalItems } from '../../store/slices/cartSlice';
import cartService from '../../api/cartService';
import { useToast } from '../../context/ToastContext';
import { useWishlist } from '../../context/WishlistContext';
import AsyncImage from '../common/AsyncImage';
import type { Product } from '../../types/product.types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { wishlistIds, toggleWishlist } = useWishlist();
  
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isAdding, setIsAdding] = useState(false);
  const [isTogglingWish, setIsTogglingWish] = useState(false);

  const isWishlisted = wishlistIds.has(product.id);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.info('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để lưu sản phẩm yêu thích.');
      navigate('/login');
      return;
    }
    setIsTogglingWish(true);
    try {
      await toggleWishlist(product.id);
    } catch {
      toast.error('Lỗi', 'Không thể cập nhật danh sách yêu thích.');
    } finally {
      setIsTogglingWish(false);
    }
  };

  // Xử lý thêm vào giỏ
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info("Yêu cầu đăng nhập", "Vui lòng đăng nhập để mua hàng.");
      navigate('/login');
      return;
    }

    setIsAdding(true);
    try {
      await cartService.addItemToCart({
        productId: product.id,
        quantity: 1
      });
      dispatch(fetchTotalItems());
      toast.success('Đã thêm vào giỏ', product.title);
    } catch (error: any) {
      toast.error('Lỗi', error.response?.data?.message || 'Không thể thêm sản phẩm.');
    } finally {
      setIsAdding(false);
    }
  };

  // Safe check giá
  const priceNew = product.priceNew || 0;
  const priceOld = product.priceOld || 0;
  
  const discountPercent = priceOld > priceNew 
    ? Math.round(((priceOld - priceNew) / priceOld) * 100) 
    : 0;

  const unit = product.dosageForm || 'Hộp';

  return (
    <div className="group/card relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
      
      {/* Badge giảm giá */}
      {discountPercent > 0 && (
        <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded z-10 shadow-sm">
          -{discountPercent}%
        </span>
      )}

      {/* Ảnh sản phẩm */}
      <Link to={`/products/${product.slug}`} className="block relative overflow-hidden aspect-square shrink-0 bg-gray-50">
        <AsyncImage 
          src={product.thumbnail} 
          alt={product.title}
          className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
        />
        
        {/* Nút yêu thích (luôn hiển thị góc phải) */}
        <button
          onClick={handleToggleWishlist}
          disabled={isTogglingWish}
          className={`absolute top-2 right-2 z-10 p-1.5 rounded-full shadow transition ${
            isWishlisted
              ? 'bg-red-500 text-white'
              : 'bg-white/90 text-gray-400 hover:text-red-500'
          }`}
          title={isWishlisted ? 'Bỏ yêu thích' : 'Yêu thích'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

      {/* Nút thêm giỏ hàng (Overlay) */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center gap-2">
           <button 
             onClick={handleAddToCart}
             disabled={isAdding}
             className="p-2.5 bg-white rounded-full hover:bg-primary hover:text-white transition disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
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

      {/* Thông tin chi tiết */}
      <div className="p-3 flex flex-col flex-1">
        {/* Tên sản phẩm */}
        <Link to={`/products/${product.slug}`} className="mb-2 block">
          <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 hover:text-primary transition leading-snug min-h-[40px]">
            {product.title}
          </h3>
        </Link>

        {/* Giá / Đơn vị */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="text-base sm:text-lg font-bold text-primary">
              {priceNew.toLocaleString('vi-VN')} đ
            </span>
            <span className="text-xs text-gray-500 font-medium">/ {unit}</span>
          </div>

          {priceOld > priceNew && (
            <div className="text-xs text-gray-400 line-through mt-0.5">
              {priceOld.toLocaleString('vi-VN')} đ
            </div>
          )}

          {/* Nút thêm giỏ hàng - luôn hiển thị trên mobile */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding || !product.active || product.quantity === 0}
            className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition
              bg-primary/10 text-primary hover:bg-primary hover:text-white
              disabled:opacity-50 disabled:cursor-not-allowed
              sm:hidden"
          >
            {isAdding ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ShoppingCart className="w-3.5 h-3.5" />
            )}
            {product.quantity === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;