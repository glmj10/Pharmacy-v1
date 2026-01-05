import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchTotalItems } from '../../store/slices/cartSlice';
import cartService from '../../api/cartService';
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
  
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isAdding, setIsAdding] = useState(false);

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

  // Xác định đơn vị tính (Ưu tiên dosageForm, nếu không có thì mặc định là 'Hộp')
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
        {/* Loại sản phẩm / Brand */}
        <div className="text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider">
            {product.brand?.name || product.productType || 'Pharmacy'}
        </div>
        
        {/* Tên sản phẩm */}
        <Link to={`/products/${product.slug}`} className="mb-2 block">
          <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 hover:text-primary transition leading-snug min-h-[40px]">
            {product.title}
          </h3>
        </Link>

        {/* ===> PHẦN GIÁ / ĐƠN VỊ (CẬP NHẬT) <=== */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="text-lg font-bold text-primary">
              {priceNew.toLocaleString('vi-VN')} đ
            </span>
            {/* Hiển thị đơn vị tính màu xám nhỏ bên cạnh */}
            <span className="text-xs text-gray-500 font-medium">
               / {unit}
            </span>
          </div>

          {/* Giá cũ (nếu có) */}
          {priceOld > priceNew && (
            <div className="text-xs text-gray-400 line-through mt-0.5">
              {priceOld.toLocaleString('vi-VN')} đ
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;