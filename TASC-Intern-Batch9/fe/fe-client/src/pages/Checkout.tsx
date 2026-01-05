import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Truck, CreditCard, MapPin, FileText, Loader2, ArrowLeft, Banknote, QrCode, ChevronRight, Ticket } from 'lucide-react';

// Redux & Actions
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { fetchCart, fetchTotalItems } from '../store/slices/cartSlice';

// API & Types
import orderService from '../api/orderService';
import { type Profile } from '../types/profile.types';
// Context & Utils
import { useToast } from '../context/ToastContext';
import { cn } from '../lib/utils';

// Components
import AddressList from '../components/profile/AddressList';
import AsyncImage from '../components/common/AsyncImage';
import type { OrderRequest } from '../types/order.types';
import CheckoutVoucherModal from '../components/voucher/CheckoutVoucherModal'; // Import Modal
import type { Voucher } from '../types/voucher.types';

interface CheckoutFormInputs {
  note: string;
  paymentMethod: 'COD' | 'VNPAY';
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  // 1. Lấy dữ liệu từ Redux
  const { items } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.auth);

  // 2. Lọc sản phẩm được chọn để thanh toán
  const checkoutItems = items.filter(item => item.selected);

  const subTotal = checkoutItems.reduce((total, item) => total + (item.priceAtAddition * item.quantity), 0);

  // Tính tổng tiền (Sử dụng priceAtAddition từ CartItemResponse)
  const totalAmount = checkoutItems.reduce((total, item) => total + (item.priceAtAddition * item.quantity), 0);

  // State
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  const calculateDiscountAmount = () => {
    if (!selectedVoucher) return 0;

    let discount = 0;
    if (selectedVoucher.discountType === 'PERCENTAGE') {
      discount = (subTotal * selectedVoucher.discountValue) / 100;
      // Cắt trần nếu vượt quá maxDiscountAmount
      if (selectedVoucher.maxDiscountAmount && discount > selectedVoucher.maxDiscountAmount) {
        discount = selectedVoucher.maxDiscountAmount;
      }
    } else {
      discount = selectedVoucher.discountValue;
    }

    // Giảm giá không được vượt quá tổng tiền hàng
    return Math.min(discount, subTotal);
  };

  const discountAmount = calculateDiscountAmount();
  const finalTotal = subTotal - discountAmount;
  // Form
  const { register, handleSubmit, watch } = useForm<CheckoutFormInputs>({
    defaultValues: {
      paymentMethod: 'COD',
      note: ''
    }
  });

  const paymentMethod = watch('paymentMethod');

  // Guard: Nếu không có sản phẩm nào được chọn -> Đá về giỏ hàng
  if (checkoutItems.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const onSubmit = async (data: CheckoutFormInputs) => {
    // Validate địa chỉ
    if (!selectedProfile) {
      toast.warning('Chưa chọn địa chỉ', 'Vui lòng chọn hoặc thêm địa chỉ giao hàng mới.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Chuẩn bị Payload
      const orderPayload: OrderRequest = {
        profileId: selectedProfile.id,
        note: data.note,
        paymentMethod: data.paymentMethod,
        voucherId: selectedVoucher ? selectedVoucher.id : undefined
      };

      console.log("Submitting Order:", orderPayload);

      // 2. Gọi API Tạo đơn hàng
      const res: any = await orderService.createOrder(orderPayload);

      const rawData = res.data || res.result;
      let paymentUrl = "";

      if (typeof rawData === 'string') {
        paymentUrl = rawData;
      } else if (typeof rawData === 'object' && rawData !== null) {
        paymentUrl = rawData.paymentUrl || rawData.url || "";
      }

      console.log("Extracted Payment URL:", paymentUrl);

      // 3. Phân luồng xử lý
      if (data.paymentMethod === 'VNPAY') {
        // Kiểm tra URL hợp lệ
        if (paymentUrl && paymentUrl.includes('http')) {
          toast.info('Đang chuyển hướng', 'Hệ thống đang chuyển sang cổng thanh toán VNPay...');

          // Delay nhẹ để Toast hiển thị
          setTimeout(() => {
            window.location.href = paymentUrl;
          }, 1000);
        } else {
          console.error("Invalid URL received:", paymentUrl);
          toast.error('Lỗi thanh toán', 'Không nhận được đường dẫn thanh toán hợp lệ từ hệ thống.');
        }
      } else {
        // COD: Thành công ngay
        toast.success('Đặt hàng thành công', 'Cảm ơn bạn đã mua hàng tại Pharmacy!');

        dispatch(fetchCart());
        dispatch(fetchTotalItems());

        navigate('/order-success');
      }

    } catch (error: any) {
      console.error('Order Error:', error);
      toast.error('Đặt hàng thất bại', error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="container mx-auto px-4">

        {/* Navigation */}
        <div className="flex items-center gap-2 mb-6">
          <Link to="/cart" className="text-gray-500 hover:text-primary transition flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Quay lại giỏ hàng
          </Link>
          <span className="text-gray-300">|</span>
          <h1 className="text-xl font-bold text-slate-800">Thanh toán</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col lg:flex-row gap-8">

          {/* === CỘT TRÁI: THÔNG TIN === */}
          <div className="lg:w-2/3 space-y-6">

            {/* 1. Chọn Địa chỉ */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Địa chỉ nhận hàng
              </h2>

              <AddressList
                mode="selection"
                selectedId={selectedProfile?.id}
                onSelect={(profile) => setSelectedProfile(profile)}
              />

              {!selectedProfile && (
                <p className="text-red-500 text-sm mt-3 flex items-center gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  Vui lòng chọn địa chỉ giao hàng.
                </p>
              )}
            </div>

            {/* 2. Phương thức thanh toán */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" /> Phương thức thanh toán
              </h2>

              <div className="space-y-3">
                {/* Option COD */}
                <label className={cn(
                  "flex items-center p-4 border rounded-xl cursor-pointer transition select-none",
                  paymentMethod === 'COD'
                    ? "border-primary bg-blue-50 ring-1 ring-primary"
                    : "border-gray-200 hover:border-gray-300"
                )}>
                  <input
                    {...register('paymentMethod')}
                    type="radio"
                    value="COD"
                    className="w-5 h-5 accent-primary"
                  />
                  <div className="ml-4 flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg text-green-600">
                      <Banknote className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="block font-medium text-gray-900">Thanh toán khi nhận hàng (COD)</span>
                      <span className="block text-sm text-gray-500">Thanh toán tiền mặt cho shipper khi nhận hàng</span>
                    </div>
                  </div>
                </label>

                {/* Option VNPay */}
                <label className={cn(
                  "flex items-center p-4 border rounded-xl cursor-pointer transition select-none",
                  paymentMethod === 'VNPAY'
                    ? "border-primary bg-blue-50 ring-1 ring-primary"
                    : "border-gray-200 hover:border-gray-300"
                )}>
                  <input
                    {...register('paymentMethod')}
                    type="radio"
                    value="VNPAY"
                    className="w-5 h-5 accent-primary"
                  />
                  <div className="ml-4 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="block font-medium text-gray-900">Thanh toán Online (VNPay)</span>
                      <span className="block text-sm text-gray-500">Quét mã QR hoặc dùng thẻ ATM/Visa nội địa</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* 3. Ghi chú */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Ghi chú đơn hàng
              </h2>
              <textarea
                {...register('note')}
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary outline-none transition resize-none"
                placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
              />
            </div>
          </div>

          {/* === CỘT PHẢI: TỔNG QUAN === */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Đơn hàng ({checkoutItems.length} món)</h3>

              {/* Danh sách sản phẩm */}
              <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4 mb-6 custom-scrollbar">
                {checkoutItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 border rounded-lg bg-gray-50 shrink-0 overflow-hidden">
                      <AsyncImage
                        // Ưu tiên lấy URL từ cart service, fallback về uuid từ product service
                        src={item.product.thumbnailUrl}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm line-clamp-2 mb-1">{item.product.title}</p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">x{item.quantity}</span>
                        <span className="font-semibold text-slate-700">{item.priceAtAddition.toLocaleString('vi-VN')} đ</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ===> SECTION CHỌN VOUCHER (MỚI) <=== */}
              <div className="py-4 border-y border-gray-100 mb-4">
                <button
                  type="button"
                  onClick={() => setIsVoucherModalOpen(true)}
                  className="w-full flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <Ticket className="w-5 h-5 text-orange-500" />
                    <span>Pharmacy Voucher</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {selectedVoucher ? (
                      <span className="text-sm font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded border border-orange-100">
                        {/* Hiển thị code hoặc số tiền giảm */}
                        -{discountAmount.toLocaleString('vi-VN')}đ
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400 group-hover:text-primary transition">Chọn hoặc nhập mã</span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
              </div>

              {/* ===> BẢNG TÍNH TIỀN (CẬP NHẬT) <=== */}
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Tạm tính</span>
                  <span>{subTotal.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Phí vận chuyển</span>
                  <span className="text-green-600 font-medium">Miễn phí</span>
                </div>

                {/* Dòng giảm giá (chỉ hiện khi có voucher) */}
                {selectedVoucher && (
                  <div className="flex justify-between text-orange-600 text-sm font-medium animate-in fade-in">
                    <span>Voucher giảm giá</span>
                    <span>-{discountAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-2">
                  <span className="font-bold text-lg text-gray-800">Tổng thanh toán</span>
                  {/* Hiển thị giá cuối cùng (Final Total) */}
                  <span className="font-bold text-xl text-primary">{finalTotal.toLocaleString('vi-VN')} đ</span>
                </div>
                <p className="text-xs text-right text-gray-400">(Đã bao gồm VAT)</p>
              </div>

              {/* Nút Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-red-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wide"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" /> Đang xử lý...
                  </>
                ) : (
                  <>
                    <Truck className="w-5 h-5" /> Đặt hàng ngay
                  </>
                )}
              </button>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  Nhấn "Đặt hàng ngay" đồng nghĩa với việc bạn đồng ý tuân theo <a href="#" className="text-primary hover:underline">Điều khoản Pharmacy</a>.
                </p>
              </div>
            </div>
          </div>

        </form>
      </div>

      {/* Voucher Modal */}
      <CheckoutVoucherModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        orderTotal={subTotal}
        selectedVoucherId={selectedVoucher?.id}
        onSelect={(voucher) => {
          setSelectedVoucher(voucher);
          // Modal sẽ tự đóng trong handleSelect
        }}
      />
    </div>
  );
};

export default Checkout;