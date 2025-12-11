import React, { useEffect, useState } from 'react';
import { X, Calendar, MapPin, Phone, User, Package, CreditCard, DollarSign, Loader2, Star, PenTool, CheckCircle } from 'lucide-react';
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
                                                                url={item.product.thumbnailUrl} // Ưu tiên 1: Link từ CartService
                                                                uuid={item.product.thumbnail}   // Ưu tiên 2: UUID từ ProductService
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
                                                        {item.isRated ? (
                                                            // TRƯỜNG HỢP 1: ĐÃ ĐÁNH GIÁ
                                                            <div className="flex flex-col items-center gap-1">
                                                                <div className="flex text-yellow-400">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star key={i} className="w-3 h-3 fill-current" />
                                                                    ))}
                                                                </div>
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
                <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end items-center gap-4">
                    <span className="text-gray-500 font-medium">Tổng tiền thanh toán:</span>
                    <span className="text-2xl font-bold text-primary">{order.totalPrice.toLocaleString('vi-VN')} đ</span>
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