import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Loader2 } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { fetchCart, fetchTotalItems } from '../store/slices/cartSlice';
import cartService from '../api/cartService';
import { useToast } from '../context/ToastContext';
import { useModal } from '../context/ModalContext';
import CartItemRow from '../components/cart/CartItemRow';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { openModal } = useModal();

  const { items, loading } = useAppSelector((state) => state.cart);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Load giỏ hàng khi vào trang
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    } else {
      navigate('/login');
    }
  }, [isAuthenticated, dispatch, navigate]);

  // Helper để reload lại toàn bộ dữ liệu sau khi thao tác
  const refreshCart = () => {
    dispatch(fetchCart());
    dispatch(fetchTotalItems());
  };

  const handleClearCart = () => {
    openModal(
      'warning',
      'Làm sạch giỏ hàng',
      'Hành động này sẽ xóa toàn bộ sản phẩm trong giỏ. Bạn có chắc không?',
      async () => {
        try {
          await cartService.clearCart();
          toast.success("Thành công", "Đã xóa toàn bộ giỏ hàng");
          refreshCart();
        } catch (error) {
          toast.error("Lỗi", "Không thể xóa giỏ hàng");
        }
      },
      'Xóa tất cả',
      'Giữ lại'
    );
  };

  const handleToggleAll = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      await cartService.selectAllItems(e.target.checked);
      refreshCart();
    } catch (error) { console.error(error); }
  };

  const handleCheckout = () => {
    const hasSelected = items.some(i => i.selected);
    if (!hasSelected) {
      toast.warning("Chưa chọn sản phẩm", "Vui lòng chọn ít nhất 1 sản phẩm để thanh toán.");
      return;
    }
    navigate('/checkout');
  };

  // 1. Lọc ra các sản phẩm được chọn
  const selectedItems = items.filter(item => item.selected);

  // 2. Tính tổng tiền thanh toán (Frontend tự tính)
  const totalSelectedPrice = selectedItems.reduce((total, item) => {
    return total + (item.priceAtAddition * item.quantity);
  }, 0);

  // 3. Tính tổng số lượng item được chọn
  const totalSelectedCount = selectedItems.reduce((total, item) => {
    return total + item.quantity;
  }, 0);

  // Tính toán UI
  const isAllSelected = items.length > 0 && items.every(i => i.selected);

  if (loading && items.length === 0) {
    return <div className="min-h-[60vh] flex justify-center items-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-slate-50 px-4">
        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Giỏ hàng của bạn đang trống</h2>
        <Link to="/" className="mt-6 px-8 py-3 bg-primary text-white rounded-full font-medium hover:bg-blue-600 transition shadow-lg flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" /> Quay lại mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-slate-50">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Giỏ hàng</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* CỘT TRÁI */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-t-xl border-b border-gray-200 p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="selectAll"
                checked={isAllSelected}
                onChange={handleToggleAll}
                className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
              />
              <label htmlFor="selectAll" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                Chọn tất cả ({items.length})
              </label>
            </div>
            <button onClick={handleClearCart} className="text-sm text-gray-500 hover:text-red-500 font-medium transition">
              Xóa tất cả
            </button>
          </div>

          <div className="bg-white rounded-b-xl shadow-sm border border-t-0 border-gray-200 p-6 pt-2">
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <CartItemRow key={item.id} item={item} onUpdate={refreshCart} />
              ))}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Tổng cộng đơn hàng</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Đã chọn:</span><span className="font-medium">{totalSelectedCount} sản phẩm</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                <span className="font-bold text-gray-800">Thành tiền:</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-primary block">{totalSelectedPrice.toLocaleString('vi-VN')} đ</span>
                  <span className="text-xs text-gray-500">(Đã bao gồm VAT)</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={totalSelectedCount === 0}
              className={`w-full py-3.5 rounded-xl font-bold transition shadow-lg uppercase tracking-wide ${totalSelectedCount > 0 ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
            >
              Mua hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;