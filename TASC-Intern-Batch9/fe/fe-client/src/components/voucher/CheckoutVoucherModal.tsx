import React, { useEffect, useState } from 'react';
import { X, Ticket, Loader2, CheckCircle } from 'lucide-react';
import voucherService from '../../api/voucherService';
import { cn } from '../../lib/utils';
import type { Voucher } from '../../types/voucher.types';

interface CheckoutVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderTotal: number; // Tổng tiền đơn hàng để check điều kiện
  selectedVoucherId?: number;
  onSelect: (voucher: Voucher | null) => void;
}

const CheckoutVoucherModal: React.FC<CheckoutVoucherModalProps> = ({ 
  isOpen, onClose, orderTotal, selectedVoucherId, onSelect 
}) => {
  const [privateVouchers, setPrivateVouchers] = useState<Voucher[]>([]);
  const [publicVouchers, setPublicVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'private' | 'public'>('private');

  useEffect(() => {
    if (isOpen) {
      fetchAvailableVouchers();
    }
  }, [isOpen]);

  const fetchAvailableVouchers = async () => {
    setLoading(true);
    try {
      // Gọi song song 2 API: Voucher công khai & Voucher trong ví
      const [publicRes, privateRes] = await Promise.all([
        voucherService.getVouchers(1, 50, 'PUBLIC'), // Lấy voucher công khai
        voucherService.getUserVouchers(1, 50)       // Lấy voucher trong ví
      ]);

      const publicList = publicRes?.data?.content || [];
      const privateList = privateRes?.data?.content || [];

      // Lọc voucher theo trạng thái ACTIVE và chưa sử dụng
      const filterValidVouchers = (vouchers: Voucher[]) => {
        return vouchers.filter((v: Voucher) => v.status === 'ACTIVE' && !v.used);
      };

      setPrivateVouchers(filterValidVouchers(privateList));
      setPublicVouchers(filterValidVouchers(publicList));
    } catch (error) {
      console.error("Lỗi tải voucher", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Tính toán mức giảm để hiển thị (Preview)
  const calculateDiscount = (v: Voucher) => {
    if (v.discountType === 'PERCENTAGE') {
      const amount = (orderTotal * v.discountValue) / 100;
      const final = Math.min(amount, v.maxDiscountAmount);
      return final;
    }
    return v.discountValue; // Fixed Amount
  };

  const handleSelect = (voucher: Voucher) => {
    // Check điều kiện đơn tối thiểu
    if (orderTotal < voucher.minOrderValue) return; 
    onSelect(voucher);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-orange-500" /> Chọn Voucher
            </h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('private')}
              className={cn(
                "flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all",
                activeTab === 'private'
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              <span className="flex items-center justify-center gap-2">
                <Ticket className="w-4 h-4" />
                Độc Quyền {privateVouchers.length > 0 && `(${privateVouchers.length})`}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('public')}
              className={cn(
                "flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all",
                activeTab === 'public'
                  ? "bg-orange-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              <span className="flex items-center justify-center gap-2">
                <Ticket className="w-4 h-4" />
                Công Khai {publicVouchers.length > 0 && `(${publicVouchers.length})`}
              </span>
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500"/>
            </div>
          ) : (
            <>
              {/* Voucher Độc Quyền Tab */}
              {activeTab === 'private' && (
                <div className="space-y-3">
                  {privateVouchers.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Ticket className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>Bạn chưa có voucher độc quyền nào.</p>
                    </div>
                  ) : (
                    privateVouchers.map((v) => {
                      const isEligible = orderTotal >= v.minOrderValue;
                      const isSelected = selectedVoucherId === v.id;
                      const discountAmt = calculateDiscount(v);
                      const isUsed = v.used || false;
                      const canUse = isEligible && !isUsed;

                      return (
                        <div 
                          key={v.id}
                          onClick={() => canUse && handleSelect(v)}
                          className={cn(
                            "relative flex bg-white border rounded-lg overflow-hidden transition-all",
                            !canUse ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-md hover:border-purple-300",
                            isSelected ? "border-purple-500 ring-2 ring-purple-500 shadow-md" : "border-purple-200"
                          )}
                        >
                          {/* Cột trái */}
                          <div className={cn(
                            "w-24 flex flex-col items-center justify-center p-2 border-r border-dashed",
                            "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 text-purple-600"
                          )}>
                            <Ticket className="w-6 h-6 mb-1" />
                            <span className="text-xs font-bold text-center break-all">{v.code}</span>
                          </div>

                          {/* Cột phải */}
                          <div className="flex-1 p-3 flex flex-col justify-between">
                            <div>
                              <p className="text-sm font-bold text-slate-800">{v.description}</p>
                              <p className="text-xs text-gray-500 mt-1">Đơn tối thiểu {v.minOrderValue.toLocaleString('vi-VN')}đ</p>
                              {isEligible && !isUsed && (
                                 <p className="text-xs text-purple-600 font-medium mt-1">
                                   Giảm được: {discountAmt.toLocaleString('vi-VN')}đ
                                 </p>
                              )}
                            </div>
                            {isUsed ? (
                                <p className="text-xs text-blue-500 font-medium mt-2">Đã sử dụng</p>
                            ) : !isEligible && (
                                <p className="text-xs text-red-500 font-medium mt-2">Chưa đủ điều kiện</p>
                            )}
                          </div>

                          {/* Check icon nếu chọn */}
                          {isSelected && (
                            <div className="absolute top-2 right-2 text-purple-500">
                              <CheckCircle className="w-5 h-5 fill-purple-100" />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Voucher Công Khai Tab */}
              {activeTab === 'public' && (
                <div className="space-y-3">
                  {publicVouchers.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Ticket className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>Không có voucher công khai khả dụng.</p>
                    </div>
                  ) : (
                    publicVouchers.map((v) => {
                      const isEligible = orderTotal >= v.minOrderValue;
                      const isSelected = selectedVoucherId === v.id;
                      const discountAmt = calculateDiscount(v);
                      const isUsed = v.used || false;
                      const canUse = isEligible && !isUsed;
                      const remainingCount = v.collectedCount !== undefined ? v.usageLimit - v.collectedCount : null;
                      const remainingPercentage = v.collectedCount !== undefined && v.usageLimit > 0 
                        ? ((v.usageLimit - v.collectedCount) / v.usageLimit) * 100 
                        : 100;

                      return (
                        <div 
                          key={v.id}
                          onClick={() => canUse && handleSelect(v)}
                          className={cn(
                            "relative flex bg-white border rounded-lg overflow-hidden transition-all",
                            !canUse ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-md hover:border-orange-300",
                            isSelected ? "border-orange-500 ring-2 ring-orange-500 shadow-md" : "border-orange-200"
                          )}
                        >
                          {/* Cột trái */}
                          <div className={cn(
                            "w-24 flex flex-col items-center justify-center p-2 border-r border-dashed",
                            "bg-orange-50 border-orange-200 text-orange-600"
                          )}>
                            <Ticket className="w-6 h-6 mb-1" />
                            <span className="text-xs font-bold text-center break-all">{v.code}</span>
                          </div>

                          {/* Cột phải */}
                          <div className="flex-1 p-3 flex flex-col justify-between">
                            <div>
                              <p className="text-sm font-bold text-slate-800">{v.description}</p>
                              <p className="text-xs text-gray-500 mt-1">Đơn tối thiểu {v.minOrderValue.toLocaleString('vi-VN')}đ</p>
                              {isEligible && !isUsed && (
                                 <p className="text-xs text-orange-600 font-medium mt-1">
                                   Giảm: {discountAmt.toLocaleString('vi-VN')}đ
                                 </p>
                              )}
                              {remainingCount !== null && (
                                <div className="mt-2">
                                  {remainingCount > 0 ? (
                                    <>
                                      <div className="flex items-center justify-between text-[10px] mb-1">
                                        <span className="font-medium text-orange-600">
                                          Còn {remainingCount.toLocaleString('vi-VN')}
                                        </span>
                                        <span className="text-gray-400">
                                          {v.collectedCount?.toLocaleString('vi-VN')}/{v.usageLimit.toLocaleString('vi-VN')}
                                        </span>
                                      </div>
                                      {/* Progress Bar */}
                                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-300"
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
                            {isUsed ? (
                                <p className="text-xs text-blue-500 font-medium mt-2">Đã sử dụng</p>
                            ) : !isEligible && (
                                <p className="text-xs text-red-500 font-medium mt-2">Chưa đủ điều kiện</p>
                            )}
                          </div>

                          {/* Check icon nếu chọn */}
                          {isSelected && (
                            <div className="absolute top-2 right-2 text-orange-500">
                              <CheckCircle className="w-5 h-5 fill-orange-100" />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer: Bỏ chọn */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <button 
            onClick={() => { onSelect(null); onClose(); }}
            className="w-full py-2.5 border border-gray-300 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition"
          >
            Không sử dụng voucher
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutVoucherModal;
