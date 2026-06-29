import React, { useState } from 'react';
import { Trash2, Plus, Minus, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CartItemResponse } from '../../types/cart.types';
import cartService from '../../api/cartService';
import AsyncImage from '../common/AsyncImage';
import { useModal } from '../../context/ModalContext';

interface CartItemRowProps {
  item: CartItemResponse;
  onUpdate: () => void; // Callback để cha reload lại giỏ hàng
}

const CartItemRow: React.FC<CartItemRowProps> = ({ item, onUpdate }) => {
  const { openModal } = useModal();
  const [isUpdating, setIsUpdating] = useState(false);
  console.log(item)
  // Thay đổi số lượng
  const handleQuantityChange = async (newQty: number) => {
    if (newQty < 1) return;
    setIsUpdating(true);
    try {
      await cartService.updateItemQuantity(item.id, newQty); // Gọi API PUT /item/{id}
      onUpdate(); // Reload
    } catch (error) { console.error(error); }
    finally { setIsUpdating(false); }
  };

 const handleToggle = async () => {
    // setIsUpdating(true);
    try {
      await cartService.updateItemStatus(item.id, !item.selected);
      onUpdate();
    } catch (error) { console.error(error); }
  };

  const handleRemove = () => {
    openModal(
      'warning', 
      'Xóa sản phẩm',
      `Bạn có chắc muốn xóa "${item.product.title}" khỏi giỏ hàng?`,
      async () => {
        try {
          await cartService.removeItemFromCart(item.id);
          onUpdate();
        } catch (error) {
          console.error(error);
        }
      },
      'Xóa ngay', 
      'Hủy bỏ'    
    );
  };

  return (
    <div className={`py-5 border-b border-gray-100 last:border-0 ${item.isOutOfStock ? 'opacity-50' : ''}`}>
      <div className="flex gap-3">

        {/* Checkbox */}
        <div className="shrink-0 pt-1">
          <input
            type="checkbox"
            checked={item.selected}
            onChange={handleToggle}
            disabled={item.isOutOfStock}
            className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
          />
        </div>

        {/* Image */}
        <Link to={`/products/${item.product.slug}`} className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 border rounded-lg overflow-hidden bg-gray-50">
          <AsyncImage
            src={item.product.thumbnailUrl}
            alt={item.product.title}
            className="w-full h-full object-cover"
          />
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
          {/* Name + Delete */}
          <div className="flex items-start justify-between gap-2">
            <Link to={`/products/${item.product.slug}`} className="font-medium text-slate-800 line-clamp-2 hover:text-primary transition text-sm sm:text-base leading-snug">
              {item.product.title}
            </Link>
            <button onClick={handleRemove} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition shrink-0">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {item.isOutOfStock && (
            <span className="text-xs text-red-500 font-bold">Hết hàng</span>
          )}

          {/* Quantity + Price row */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Quantity Control */}
            <div className="flex items-center border border-gray-300 rounded-lg h-9">
              <button
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={isUpdating || item.quantity <= 1}
                className="px-3 hover:bg-gray-100 text-gray-600 transition h-full flex items-center justify-center disabled:opacity-40"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-9 text-center font-medium text-sm text-slate-800">
                {isUpdating ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : item.quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={isUpdating}
                className="px-3 hover:bg-gray-100 text-gray-600 transition h-full flex items-center justify-center disabled:opacity-40"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Price */}
            <div className="font-bold text-primary text-sm sm:text-base">
              {(item.priceAtAddition * item.quantity).toLocaleString('vi-VN')} đ
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItemRow;