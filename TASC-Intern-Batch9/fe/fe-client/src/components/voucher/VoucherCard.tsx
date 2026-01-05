import React, { useState } from 'react';
import { Ticket, Clock, Loader2, Copy, Check, Info, X } from 'lucide-react';
import voucherService from '../../api/voucherService';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import type { Voucher } from '../../types/voucher.types';

interface VoucherCardProps {
  voucher: Voucher;
  isOwned?: boolean; 
  onClaimSuccess?: () => void;
}

const VoucherCard: React.FC<VoucherCardProps> = ({ voucher, isOwned = false, onClaimSuccess }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const isPublic = voucher.type === 'PUBLIC';
  
  const hasClaimed = voucher.claimed || isOwned;
  const isUsed = voucher.used || false;
  console.log(hasClaimed)

  const isActive = voucher.status === 'ACTIVE';
  const isExpired = voucher.status === 'EXPIRED';
  const isCancelled = voucher.status === 'CANCELLED';
  const isInactive = voucher.status === 'INACTIVE';

  const renderDiscountValue = () => {
    if (voucher.discountType === 'PERCENTAGE') {
      return `Giảm ${voucher.discountValue}%`;
    }
    return `Giảm ${voucher.discountValue.toLocaleString('vi-VN')}k`;
  };

  const renderStatusBadge = () => {
    if (isUsed) {
      return (
        <div className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
          <span>Đã sử dụng</span>
        </div>
      );
    }
    if (isExpired) {
      return (
        <div className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
          <span>Đã hết hạn</span>
        </div>
      );
    }
    if (isCancelled) {
      return (
        <div className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
          <span>Đã hủy</span>
        </div>
      );
    }
    if (isInactive) {
      return (
        <div className="inline-flex items-center gap-1 text-[10px] font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded">
          <span>Tạm ngưng</span>
        </div>
      );
    }
    return null;
  };

  const getVoucherTypeLabel = () => {
    const typeMap: Record<string, string> = {
      'SHIPPING': 'Miễn phí vận chuyển',
      'ORDER': 'Giảm giá đơn hàng',
      'PRODUCT': 'Giảm giá sản phẩm',
      'PUBLIC': 'Voucher công khai',
      'PRIVATE': 'Voucher độc quyền'
    };
    return typeMap[voucher.type] || voucher.type;
  };

  const handleClaim = async () => {
    if (!isAuthenticated) {
      // toast.info('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để lưu voucher!');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      await voucherService.claimVoucher({ voucherId: voucher.id });
      toast.success('Thành công', 'Đã lưu voucher vào ví!');
      
      // Callback để cha reload lại danh sách (để cập nhật isClaimed thành true)
      if (onClaimSuccess) onClaimSuccess();
    } catch (error: any) {
      toast.error('Thất bại', error.response?.data?.message || 'Không thể lưu voucher.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(voucher.code);
    setCopied(true);
    toast.success('Đã sao chép', `Mã ${voucher.code}`);
    setTimeout(() => setCopied(false), 2000);
  };

  // Tính số lượng còn lại cho voucher (cả công khai và độc quyền)
  const getRemainingCount = () => {
    if (voucher.collectedCount === undefined) return null;
    return voucher.usageLimit - voucher.collectedCount;
  };

  const remainingCount = getRemainingCount();
  
  const getRemainingPercentage = () => {
    if (voucher.collectedCount === undefined || voucher.usageLimit === 0) return 100;
    const remaining = voucher.usageLimit - voucher.collectedCount;
    return (remaining / voucher.usageLimit) * 100;
  };

  const remainingPercentage = getRemainingPercentage();

  return (
    <div className={`relative flex w-full bg-white border border-gray-200 rounded-lg shadow-sm transition-shadow overflow-hidden min-h-[120px] ${
      !isActive || isUsed ? 'opacity-60 grayscale' : 'hover:shadow-md'
    }`}>
      
      {/* CỘT TRÁI: DECORATION */}
      <div className={`w-[30%] flex flex-col items-center justify-center text-white p-2 relative border-r border-dashed border-gray-200 ${
        isPublic ? 'bg-gradient-to-br from-orange-400 to-red-500' : 'bg-gradient-to-br from-purple-500 to-pink-500'
      }`}>
        <div className="absolute -right-1.5 top-0 w-3 h-3 bg-slate-50 rounded-full"></div>
        <div className="absolute -right-1.5 bottom-0 w-3 h-3 bg-slate-50 rounded-full"></div>
        
        <Ticket className="w-8 h-8 mb-1" />
        <span className="font-bold text-center text-sm md:text-base leading-tight break-all">
          {voucher.code}
        </span>
        <span className="text-[9px] opacity-90 mt-1 uppercase font-bold tracking-wider">
          {isPublic ? 'Công khai' : 'Độc quyền'}
        </span>
      </div>

      {/* CỘT PHẢI: INFO & ACTION */}
      <div className="flex-1 p-3 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
             <div className="flex items-center gap-2">
               <h4 className="font-bold text-slate-800 text-sm md:text-base">
                 {renderDiscountValue()}
               </h4>
               {renderStatusBadge()}
             </div>
             <button onClick={handleCopyCode} className="text-gray-400 hover:text-primary transition p-1" title="Sao chép mã" disabled={!isActive}>
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
             </button>
          </div>
          
          <p className="text-xs text-gray-500 line-clamp-1 mb-1">
            Đơn tối thiểu {voucher.minOrderValue.toLocaleString('vi-VN')} đ
          </p>
          <p className="text-xs text-gray-400 line-clamp-2" title={voucher.description}>
            {voucher.description}
          </p>
          {isPublic && (
            <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
              <div className="flex items-start gap-1 text-[10px] text-gray-600">
                <span className="font-semibold min-w-[60px]">Áp dụng:</span>
                <span>{getVoucherTypeLabel()}</span>
              </div>
              {voucher.startDate && voucher.endDate && (
                <div className="flex items-start gap-1 text-[10px] text-gray-600">
                  <span className="font-semibold min-w-[60px]">Thời hạn:</span>
                  <span>
                    {new Date(voucher.startDate).toLocaleDateString('vi-VN')} - {new Date(voucher.endDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Nút xem chi tiết - Chỉ cho PRIVATE và đang ACTIVE hoặc EXPIRED */}
          {!isPublic && (isActive || isExpired) && (
            <button
              onClick={() => setShowDetailModal(true)}
              className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-purple-600 hover:text-purple-700 hover:underline"
            >
              <Info className="w-3 h-3" />
              Xem điều kiện
            </button>
          )}
          
          {/* Hiển thị số lượng còn lại cho voucher */}
          {remainingCount !== null && (
            <div className="mt-2">
              {remainingCount > 0 ? (
                <>
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className={`font-medium flex items-center gap-1 ${isPublic ? 'text-orange-600' : 'text-purple-600'}`}>
                      <Ticket className="w-3 h-3" />
                      Còn {remainingCount.toLocaleString('vi-VN')}
                    </span>
                    <span className="text-gray-400">
                      {voucher.collectedCount?.toLocaleString('vi-VN')}/{voucher.usageLimit.toLocaleString('vi-VN')}
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 rounded-full ${
                        isPublic 
                          ? 'bg-gradient-to-r from-orange-400 to-red-500' 
                          : 'bg-gradient-to-r from-purple-500 to-pink-500'
                      }`}
                      style={{ width: `${Math.max(0, Math.min(remainingPercentage, 100))}%` }}
                    />
                  </div>
                </>
              ) : (
                <div className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded">
                  <span>Đã hết</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          {voucher.endDate && (
            <div className="flex items-center gap-1 text-[10px] text-orange-500 bg-orange-50 px-2 py-0.5 rounded">
              <Clock className="w-3 h-3" />
              <span>HSD: {new Date(voucher.endDate).toLocaleDateString('vi-VN')}</span>
            </div>
          )}

          {/* ===> LOGIC NÚT BẤM (CẬP NHẬT) <=== */}
          {isUsed ? (
            // Voucher đã sử dụng - không hiển thị nút
            <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1">
              <Check className="w-3 h-3" /> Đã dùng
            </span>
          ) : isPublic ? (
            // 1. PUBLIC: Luôn hiện nút Dùng ngay
            <button 
              onClick={() => navigate('/products')}
              disabled={!isActive}
              className="text-xs font-bold text-orange-600 border border-orange-600 px-3 py-1.5 rounded hover:bg-orange-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Dùng ngay
            </button>
          ) : (
            // 2. PRIVATE: Check trạng thái đã lưu chưa
            hasClaimed ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-green-600 font-bold flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> Đã lưu
                </span>
                <button 
                  onClick={() => navigate('/products')}
                  disabled={!isActive}
                  className="text-xs font-bold text-purple-600 border border-purple-600 px-3 py-1.5 rounded hover:bg-purple-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Dùng ngay
                </button>
              </div>
            ) : remainingCount !== null && remainingCount <= 0 ? (
              // Voucher đã hết - hiển thị thông báo
              <span className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                Đã hết
              </span>
            ) : (
              <button 
                onClick={handleClaim}
                disabled={loading || !isActive}
                className="text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-1.5 rounded hover:from-purple-600 hover:to-pink-600 transition flex items-center gap-1 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm shadow-purple-200"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin"/> : "Lưu"}
              </button>
            )
          )}

        </div>
      </div>
      
      {showDetailModal && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Ticket className="w-5 h-5" />
                  Chi tiết Voucher
                </h3>
                <button onClick={() => setShowDetailModal(false)} className="p-1 hover:bg-white/20 rounded-full transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold mb-1">{voucher.code}</p>
                <p className="text-sm opacity-90">{renderDiscountValue()}</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Mô tả */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">Mô tả</h4>
                <p className="text-xs text-gray-600">{voucher.description}</p>
              </div>

              {/* Điều kiện */}
              <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
                <h4 className="text-sm font-bold text-slate-800">Điều kiện sử dụng</h4>
                
                <div className="flex items-start gap-2 text-xs">
                  <span className="font-semibold text-gray-700 min-w-[100px]">Áp dụng:</span>
                  <span className="text-gray-600">{getVoucherTypeLabel()}</span>
                </div>

                <div className="flex items-start gap-2 text-xs">
                  <span className="font-semibold text-gray-700 min-w-[100px]">Đơn tối thiểu:</span>
                  <span className="text-gray-600">{voucher.minOrderValue.toLocaleString('vi-VN')} đ</span>
                </div>

                {voucher.discountType === 'PERCENTAGE' && (
                  <div className="flex items-start gap-2 text-xs">
                    <span className="font-semibold text-gray-700 min-w-[100px]">Giảm tối đa:</span>
                    <span className="text-gray-600">{voucher.maxDiscountAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}

                <div className="flex items-start gap-2 text-xs">
                  <span className="font-semibold text-gray-700 min-w-[100px]">Giới hạn/người:</span>
                  <span className="text-gray-600">{voucher.usageLimitPerUser} lần</span>
                </div>

                {voucher.startDate && voucher.endDate && (
                  <div className="flex items-start gap-2 text-xs">
                    <span className="font-semibold text-gray-700 min-w-[100px]">Thời hạn:</span>
                    <div className="text-gray-600">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Từ:</span>
                        <span>{new Date(voucher.startDate).toLocaleString('vi-VN', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="font-medium">Đến:</span>
                        <span>{new Date(voucher.endDate).toLocaleString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}</span>
                      </div>
                    </div>
                  </div>
                )}

                {remainingCount !== null && (
                  <div className="flex items-start gap-2 text-xs">
                    <span className="font-semibold text-gray-700 min-w-[100px]">Còn lại:</span>
                    <span className="text-purple-600 font-bold">{remainingCount.toLocaleString('vi-VN')} voucher</span>
                  </div>
                )}
              </div>

              {/* Footer button */}
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-600 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoucherCard;