import React, { useEffect, useState } from 'react';
import { Ticket, Loader2 } from 'lucide-react';
import voucherService from '../api/voucherService';
import VoucherCard from '../components/voucher/VoucherCard';
import Breadcrumb from '../components/common/BreadCrumb';
import type { Voucher } from '../types/voucher.types';

const VoucherCenter: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res: any = await voucherService.getVouchers(1, 20);
      
      const list = res.data?.content || [];
      console.log(list)
      setVouchers(list);
    } catch (error) {
      console.error("Lỗi tải voucher:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      
      {/* Banner Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-10 mb-8">
        <div className="container mx-auto px-4 text-center">
          <Breadcrumb 
            items={[{ label: "Trang chủ", link: "/" }, { label: "Mã giảm giá" }]} 
            className="justify-center mb-4 text-white/80 [&_a]:text-white/80 [&_a:hover]:text-white [&_span]:text-white"
          />
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center justify-center gap-3">
            <Ticket className="w-8 h-8" /> Kho Voucher
          </h1>
          <p className="text-orange-100">Săn mã giảm giá, freeship mỗi ngày</p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        
        {/* Loading State: Sử dụng Skeleton DIV thay vì VoucherCard để tránh lỗi missing prop */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex w-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden min-h-[120px] animate-pulse">
                 {/* Phần trái giả lập */}
                 <div className="w-[30%] bg-gray-200"></div>
                 {/* Phần phải giả lập */}
                 <div className="flex-1 p-3 flex flex-col justify-between">
                    <div className="space-y-2">
                       <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                       <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                       <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                       <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        ) : vouchers.length > 0 ? (
          
          // ===> Render Danh sách Voucher <===
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vouchers.map((voucherItem) => (
              <VoucherCard 
                key={voucherItem.id} 
                
                // QUAN TRỌNG: Truyền prop 'voucher' vào đây để fix lỗi TypeScript
                voucher={voucherItem} 
                
                isOwned={false} 
                onClaimSuccess={fetchVouchers} 
              />
            ))}
          </div>

        ) : (
          // Empty State
          <div className="text-center py-20 text-gray-500 flex flex-col items-center">
            <div className="p-4 bg-gray-100 rounded-full mb-4">
                <Ticket className="w-10 h-10 text-gray-400" />
            </div>
            <p>Hiện tại chưa có mã giảm giá nào.</p>
            <p className="text-sm">Quay lại sau bạn nhé!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoucherCenter;