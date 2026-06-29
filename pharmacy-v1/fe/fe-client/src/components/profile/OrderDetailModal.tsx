import React, { useEffect, useState } from 'react';
import { X, Calendar, MapPin, Phone, User, Package, CreditCard, DollarSign, Loader2, Star, PenTool, CheckCircle, Printer } from 'lucide-react';
import orderService from '../../api/orderService';
import type { OrderResponse, OrderDetailResponse } from '../../types/order.types';
import AsyncImage from '../common/AsyncImage';
import { cn } from '../../lib/utils';
import RatingModal from '../order/RatingModal';

interface OrderDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: OrderResponse | null;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ isOpen, onClose, order }) => {
    const [details, setDetails] = useState<OrderDetailResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRateOpen, setIsRateOpen] = useState(false);
    const [rateTarget, setRateTarget] = useState<{ id: number, product: any } | null>(null);

    useEffect(() => {
        const fetchDetail = async () => {
            if (isOpen && order) {
                setLoading(true);
                try {
                    const res: any = await orderService.getOrderDetail(order.id);
                    // API trả về List<OrderDetailResponse>
                    setDetails(res.data || res.result || []);
                } catch (error) {
                    console.error("Lỗi tải chi tiết đơn hàng", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchDetail();
    }, [isOpen, order]);

    if (!isOpen || !order) return null;

    // Handler mở form đánh giá
    const handleOpenRate = (item: OrderDetailResponse) => {
        setRateTarget({
            id: item.id,
            product: item.product
        });
        setIsRateOpen(true);
    };

    // Handler xuất hóa đơn
    const handlePrintInvoice = () => {
        if (!order) return;
        const printWindow = window.open('', '_blank', 'width=800,height=900');
        if (!printWindow) return;

        const rows = details.map(item => `
            <tr>
                <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;">${item.product.title}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${item.priceAtOrder.toLocaleString('vi-VN')} đ</td>
                <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;">${(item.priceAtOrder * item.quantity).toLocaleString('vi-VN')} đ</td>
            </tr>
        `).join('');

        const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Hóa đơn #${order.id}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; background: #fff; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #3b82f6; }
    .brand { font-size: 26px; font-weight: 800; color: #3b82f6; letter-spacing: -0.5px; }
    .brand span { color: #1e293b; }
    .invoice-title { text-align: right; }
    .invoice-title h2 { font-size: 22px; font-weight: 700; color: #1e293b; }
    .invoice-title p { font-size: 13px; color: #64748b; margin-top: 4px; }
    .section { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }  
    .info-box h4 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600; margin-bottom: 10px; }
    .info-box p { font-size: 14px; color: #1e293b; line-height: 1.7; }
    .info-box p strong { font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead tr { background: #f1f5f9; }
    thead th { padding: 10px 12px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600; }
    thead th:last-child, thead th:nth-child(3), thead th:nth-child(2) { text-align: right; }
    thead th:nth-child(2) { text-align: center; }
    tbody td { font-size: 14px; color: #334155; }
    .total-box { width: 280px; margin-left: auto; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
    .total-row { display: flex; justify-content: space-between; padding: 10px 16px; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
    .total-row:last-child { border-bottom: none; background: #3b82f6; color: #fff; font-size: 16px; font-weight: 700; border-radius: 0 0 9px 9px; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #94a3b8; }
    @media print { body { padding: 24px; } button { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Pharmacy</span></div>
      <p style="font-size:12px;color:#64748b;margin-top:4px;">Hệ thống nhà thuốc trực tuyến</p>
    </div>
    <div class="invoice-title">
      <h2>HÓA ĐƠN BÁN HÀNG</h2>
      <p>Mã đơn: #${order.id}</p>
      <p>Ngày: ${new Date(order.createdAt).toLocaleString('vi-VN')}</p>
    </div>
  </div>

  <div class="section">
    <div class="info-box">
      <h4>Thông tin người nhận</h4>
      <p><strong>${order.customerName}</strong></p>
      <p>Số điện thoại ${order.customerPhoneNumber}</p>
      <p>Địa chỉ: ${order.customerAddress}</p>
    </div>
    <div class="info-box">
      <h4>Thông tin thanh toán</h4>
      <p>Phương thức: <strong>${order.paymentMethod}</strong></p>
      <p>Trạng thái TT: <strong>${order.paymentStatus}</strong></p>
      ${order.note ? `<p>Ghi chú: <em>${order.note}</em></p>` : ''}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Sản phẩm</th>
        <th style="text-align:center">SL</th>
        <th style="text-align:right">Đơn giá</th>
        <th style="text-align:right">Tạm tính</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="total-box">
    <div class="total-row"><span>Tổng cộng</span><span>${order.totalPrice.toLocaleString('vi-VN')} đ</span></div>
  </div>

  <div class="footer">
    <p>Cảm ơn quý khách đã tin tưởng và mua hàng tại Pharmacy!</p>
    <p style="margin-top:4px;">Hotline: 1800-xxxx | Email: support@pharmacy.vn</p>
  </div>

  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

        printWindow.document.write(html);
        printWindow.document.close();
    };


    // Map trạng thái sang Tiếng Việt
    const statusMap: Record<string, { label: string; color: string }> = {
        PENDING: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-700' },
        SHIPPING: { label: 'Đang giao hàng', color: 'bg-blue-100 text-blue-700' },
        DELIVERED: { label: 'Giao thành công', color: 'bg-green-100 text-green-700' },
        CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
        FAILED: { label: 'Thất bại', color: 'bg-gray-100 text-gray-700' }
    };

    const currentStatus = statusMap[order.status] || { label: order.status, color: 'bg-gray-100' };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                            Chi tiết đơn hàng #{order.id}
                            <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase", currentStatus.color)}>
                                {currentStatus.label}
                            </span>
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* 1. Thông tin người nhận */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h4 className="font-bold text-gray-800 border-b pb-2 mb-2">Thông tin giao hàng</h4>
                            <div className="flex items-start gap-3 text-sm text-gray-600">
                                <User className="w-4 h-4 mt-0.5 text-gray-400" />
                                <span className="font-medium text-gray-900">{order.customerName}</span>
                            </div>
                            <div className="flex items-start gap-3 text-sm text-gray-600">
                                <Phone className="w-4 h-4 mt-0.5 text-gray-400" />
                                <span>{order.customerPhoneNumber}</span>
                            </div>
                            <div className="flex items-start gap-3 text-sm text-gray-600">
                                <MapPin className="w-4 h-4 mt-0.5 text-gray-400" />
                                <span className="leading-relaxed">{order.customerAddress}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-bold text-gray-800 border-b pb-2 mb-2">Thanh toán</h4>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <CreditCard className="w-4 h-4 text-gray-400" />
                                <span>Phương thức: <span className="font-medium">{order.paymentMethod}</span></span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <DollarSign className="w-4 h-4 text-gray-400" />
                                <span>Trạng thái: <span className={cn("font-medium", order.paymentStatus === 'COMPLETED' ? "text-green-600" : "text-orange-600")}>{order.paymentStatus}</span></span>
                            </div>
                            {order.note && (
                                <div className="p-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-100 italic">
                                    "Ghi chú: {order.note}"
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 2. Danh sách sản phẩm */}
                    <div>
                        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Package className="w-4 h-4" /> Danh sách sản phẩm
                        </h4>

                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <div className="border rounded-xl overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 font-medium">
                                        <tr>
                                            <th className="px-4 py-3">Sản phẩm</th>
                                            <th className="px-4 py-3 text-center">Đơn giá</th>
                                            <th className="px-4 py-3 text-center">SL</th>
                                            <th className="px-4 py-3 text-right">Tạm tính</th>
                                            {order.status === 'DELIVERED' && (
                                                <th className="px-4 py-3 text-center">Đánh giá</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {details.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 border rounded-lg overflow-hidden shrink-0">
                                                            <AsyncImage
                                                                src={item.product.thumbnailUrl}
                                                                alt={item.product.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <span className="font-medium text-slate-700 line-clamp-2">{item.product.title}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center text-gray-600">
                                                    {item.priceAtOrder.toLocaleString('vi-VN')} đ
                                                </td>
                                                <td className="px-4 py-3 text-center font-medium">
                                                    x{item.quantity}
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold text-slate-700">
                                                    {(item.priceAtOrder * item.quantity).toLocaleString('vi-VN')} đ
                                                </td>


                                                {/* ===> CỘT ĐÁNH GIÁ (LOGIC MỚI) <=== */}
                                                {order.status === 'DELIVERED' && (
                                                    <td className="px-4 py-3 text-center">
                                                        {item.rated ? (
                                                            // TRƯỜNG HỢP 1: ĐÃ ĐÁNH GIÁ
                                                            <div className="flex flex-col items-center gap-1">
                                                                {/* <div className="flex text-yellow-400">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star key={i} className="w-3 h-3 fill-current" />
                                                                    ))}
                                                                </div> */}
                                                                <span className="text-[10px] text-green-600 font-medium flex items-center gap-0.5">
                                                                    <CheckCircle className="w-3 h-3" /> Đã đánh giá
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            // TRƯỜNG HỢP 2: CHƯA ĐÁNH GIÁ
                                                            <button
                                                                onClick={() => handleOpenRate(item)}
                                                                className="flex items-center justify-center gap-1 px-3 py-1.5 w-full text-xs font-bold text-primary bg-blue-50 border border-blue-100 rounded-lg hover:bg-primary hover:text-white hover:border-primary transition shadow-sm"
                                                                title="Viết nhận xét"
                                                            >
                                                                <PenTool className="w-3 h-3" /> Đánh giá sản phẩm
                                                            </button>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer: Tổng tiền */}
                <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center gap-4">
                    <button
                        onClick={handlePrintInvoice}
                        disabled={loading || details.length === 0}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 border border-gray-300 bg-white hover:bg-gray-50 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Printer className="w-4 h-4" /> Xuất hóa đơn
                    </button>
                    <div className="flex items-center gap-3">
                        <span className="text-gray-500 font-medium">Tổng tiền thanh toán:</span>
                        <span className="text-2xl font-bold text-primary">{order.totalPrice.toLocaleString('vi-VN')} đ</span>
                    </div>
                </div>
            </div>

            {/* Rating Modal */}
            <RatingModal
                isOpen={isRateOpen}
                onClose={() => {
                    setIsRateOpen(false);
                    setRateTarget(null);
                }}
                orderDetailId={rateTarget?.id || null}
                productInfo={rateTarget?.product ? {
                    title: rateTarget.product.title,
                    thumbnail: rateTarget.product.thumbnailUrl
                } : null}
                onSuccess={async () => {
                    // Refresh lại chi tiết đơn hàng sau khi đánh giá thành công
                    try {
                        const res: any = await orderService.getOrderDetail(order.id);
                        setDetails(res.data || res.result || []);
                    } catch (error) {
                        console.error("Lỗi tải lại chi tiết đơn hàng", error);
                    }
                }}
            />
        </div>
    );
};

export default OrderDetailModal;