import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
    User, Mail, LogOut, Camera, KeyRound, Edit, MapPin,
    ShieldCheck, Calendar, Package, Clock, CreditCard,
    Eye,
    Ticket
} from 'lucide-react';

// Hooks & Context
import { useAppDispatch } from '../store/hooks';
import { clearAuth } from '../store/slices/authSlice';
import { useModal } from '../context/ModalContext';
import { useToast } from '../context/ToastContext';
import { cn } from '../lib/utils';

// APIs & Types
import userService, { type UserResponse } from '../api/identityService';
import identityService from '../api/identityService';
import orderService from '../api/orderService';
import paymentService from '../api/paymentService';
import voucherService from '../api/voucherService';
import type { OrderResponse } from '../types/order.types';

// Components
import AsyncImage from '../components/common/AsyncImage';
import AddressList from '../components/profile/AddressList';
import ChangePasswordModal from '../components/profile/ChangePasswordModal';
import EditProfileModal from '../components/profile/EditProfileModal';
import OrderDetailModal from '../components/profile/OrderDetailModal';
import type { Voucher } from '../types/voucher.types';
import VoucherCard from '../components/voucher/VoucherCard';

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { openModal } = useModal();
    const { toast } = useToast();
    const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [myVouchers, setMyVouchers] = useState<Voucher[]>([]);
    const [vouchersLoading, setVouchersLoading] = useState(false);

    // --- STATE DATA ---
    const [profile, setProfile] = useState<UserResponse | null>(null);
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [orderStatus, setOrderStatus] = useState<string>('ALL'); // 'ALL', 'PENDING', ...

    const ORDER_STATUSES = [
        { id: 'ALL', label: 'Tất cả' },
        { id: 'PENDING', label: 'Chờ xử lý' },
        { id: 'SHIPPING', label: 'Đang giao' },
        { id: 'DELIVERED', label: 'Hoàn thành' },
        { id: 'CANCELLED', label: 'Đã hủy' },
    ];
    // --- STATE UI ---
    const [loading, setLoading] = useState(true);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [searchParams] = useSearchParams(); // <== 2. Khai báo hook

    const tabFromUrl = searchParams.get('tab');

    const [activeTab, setActiveTab] = useState<'info' | 'address' | 'orders' | 'vouchers'>(
        (tabFromUrl === 'orders' || tabFromUrl === 'address' || tabFromUrl === 'vouchers') ? tabFromUrl : 'info'
    );
    // --- STATE MODALS ---
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);


    const fetchMyVouchers = async () => {
        setVouchersLoading(true);
        try {
            const res: any = await voucherService.getUserVouchers(1, 20);
            setMyVouchers(res.data?.content || res.result?.content || []);
        } catch (error) {
            console.error(error);
        } finally {
            setVouchersLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'vouchers') {
            fetchMyVouchers();
        }
    }, [activeTab]);

    // Khi click vào nút Tab, ta cũng nên update URL để đồng bộ
    const handleTabChange = (tab: 'info' | 'address' | 'orders') => {
        setActiveTab(tab);
        navigate(`/profile?tab=${tab}`, { replace: true }); // Update URL không reload
    };

    // 1. Fetch Profile
    const fetchProfile = async () => {
        try {
            const res: any = await userService.getCurrentUser();
            setProfile(res.data || res.result);
        } catch (error) {
            console.error("Lỗi lấy hồ sơ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    // 2. Fetch Orders (Chỉ gọi khi switch sang tab Orders)
    const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
            // Nếu status là 'ALL' thì gửi undefined để lấy tất cả
            const statusParam = orderStatus === 'ALL' ? undefined : orderStatus;

            const res: any = await orderService.getMyOrders(1, 20, statusParam);
            setOrders(res.data?.content || res.result?.content || []);
        } catch (error) {
            console.error("Lỗi lấy đơn hàng", error);
        } finally {
            setOrdersLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'orders') {
            fetchOrders();
        }
    }, [activeTab, orderStatus]);

    // --- HANDLERS ---

    const handleLogout = () => {
        openModal('warning', 'Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất không?', async () => {
            try {
                await identityService.logout();
            } catch (error) {
                console.warn("Logout API failed", error);
            } finally {
                dispatch(clearAuth());
                navigate('/login');
            }
        });
    };



    const handleCancelOrder = (id: number) => {
        openModal('warning', 'Hủy đơn hàng', 'Bạn có chắc muốn hủy đơn hàng này?', async () => {
            try {
                await orderService.cancelOrder(id);
                toast.success('Thành công', 'Đã hủy đơn hàng');
                fetchOrders(); // Reload list
            } catch (error: any) {
                toast.error('Lỗi', error.response?.data?.message || 'Không thể hủy đơn hàng');
            }
        });
    };

    const handleRepay = async (id: number) => {
        try {
            toast.info('Đang xử lý', 'Đang tạo link thanh toán...');
            const res: any = await paymentService.repayOrder(id);
            const paymentUrl = res.data?.paymentUrl || res.result?.paymentUrl;

            if (paymentUrl) {
                window.location.href = paymentUrl;
            } else {
                toast.error('Lỗi', 'Không lấy được link thanh toán');
            }
        } catch (error: any) {
            toast.error('Lỗi', error.response?.data?.message || 'Lỗi hệ thống');
        }
    };

    // Handle xem chi tiết
    const handleViewDetail = (order: OrderResponse) => {
        setSelectedOrder(order);
        setIsDetailOpen(true);
    };

    const renderStatusBadge = (status: string) => {
        const map: any = {
            PENDING: { text: "Chờ xử lý", class: "bg-yellow-100 text-yellow-700" },
            SHIPPING: { text: "Đang giao", class: "bg-blue-100 text-blue-700" },
            DELIVERED: { text: "Hoàn thành", class: "bg-green-100 text-green-700" },
            CANCELLED: { text: "Đã hủy", class: "bg-red-100 text-red-700" },
            FAILED: { text: "Thất bại", class: "bg-gray-100 text-gray-700" }
        };
        const conf = map[status] || map.FAILED;
        return (
            <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold border border-transparent", conf.class)}>
                {conf.text}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 min-h-[80vh] bg-slate-50">

            <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                {/* === COVER PHOTO === */}
                <div className="h-40 bg-gradient-to-r from-blue-600 to-cyan-500 relative">
                    <div className="absolute inset-0 bg-black/10"></div>
                </div>

                <div className="px-6 md:px-10 pb-10">

                    {/* === HEADER PROFILE === */}
                    <div className="relative mb-8">

                        {/* Avatar (Absolute để đè lên cover) */}
                        <div className="absolute -top-16 left-0 md:left-0 w-full md:w-auto flex justify-center md:justify-start">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-100 overflow-hidden shadow-md">
                                    <AsyncImage
                                        src={profile?.profilePic}
                                        className="w-full h-full object-cover"
                                        fallbackSrc="https://ui-avatars.com/api/?background=random&color=fff&name=User"
                                    />
                                </div>
                                <button
                                    onClick={() => setIsEditProfileOpen(true)}
                                    className="absolute bottom-1 right-1 p-2 bg-gray-900 text-white rounded-full hover:bg-gray-700 transition shadow-lg border-2 border-white"
                                    title="Đổi ảnh đại diện"
                                >
                                    <Camera className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Info & Actions */}
                        <div className="pt-20 md:pt-0 md:pl-36 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">

                            <div className="text-center md:text-left w-full md:w-auto mt-2 md:mt-0">
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{profile?.username}</h1>
                                <p className="text-gray-500 font-medium">{profile?.email}</p>
                                <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wide">
                                        Thành viên
                                    </span>
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3" /> Đã xác thực
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 w-full md:w-auto justify-center md:justify-end">
                                <button
                                    onClick={() => setIsEditProfileOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-slate-700 hover:bg-gray-200 hover:text-slate-900 rounded-xl font-medium transition text-sm"
                                >
                                    <Edit className="w-4 h-4" /> Sửa hồ sơ
                                </button>
                                <button
                                    onClick={() => setIsPasswordModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-slate-700 hover:bg-gray-200 hover:text-slate-900 rounded-xl font-medium transition text-sm"
                                >
                                    <KeyRound className="w-4 h-4" /> Đổi mật khẩu
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-medium transition text-sm"
                                >
                                    <LogOut className="w-4 h-4" /> Đăng xuất
                                </button>

                                <button
                                    onClick={() => setActiveTab('vouchers')}
                                    className={cn("flex items-center gap-2 px-6 py-3 font-medium text-sm transition border-b-2 whitespace-nowrap", activeTab === 'vouchers' ? "border-primary text-primary bg-blue-50/50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50")}
                                >
                                    <Ticket className="w-4 h-4" /> Ví Voucher
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* === TABS NAVIGATION === */}
                    <div className="flex border-b border-gray-200 mb-8 overflow-x-auto no-scrollbar">
                        {[
                            { id: 'info', label: 'Thông tin tài khoản', icon: User },
                            { id: 'address', label: 'Sổ địa chỉ', icon: MapPin },
                            { id: 'orders', label: 'Đơn hàng của tôi', icon: Package },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id as any)} // <== Gọi hàm mới
                                className={cn(
                                    "flex items-center gap-2 px-6 py-3 font-medium text-sm transition border-b-2 whitespace-nowrap",
                                    activeTab === tab.id
                                        ? "border-primary text-primary bg-blue-50/50"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                )}
                            >
                                <tab.icon className="w-4 h-4" /> {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* === TAB CONTENT === */}
                    <div className="min-h-[300px]">

                        {/* 1. Tab Info */}
                        {activeTab === 'info' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-slate-800 border-l-4 border-primary pl-3">Thông tin cá nhân</h3>
                                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 bg-white rounded-full text-blue-500 shadow-sm"><User className="w-5 h-5" /></div>
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Tên đăng nhập</p>
                                                <p className="text-slate-800 font-medium text-lg">{profile?.username}</p>
                                            </div>
                                        </div>
                                        <div className="w-full h-px bg-gray-200"></div>
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 bg-white rounded-full text-blue-500 shadow-sm"><Mail className="w-5 h-5" /></div>
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Email</p>
                                                <p className="text-slate-800 font-medium text-lg">{profile?.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-slate-800 border-l-4 border-orange-500 pl-3">Hoạt động</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-orange-50 p-5 rounded-xl border border-orange-100 text-center">
                                            <p className="text-3xl font-bold text-orange-600 mb-1">{orders.length || 0}</p>
                                            <p className="text-xs font-semibold text-orange-800 uppercase">Đơn hàng</p>
                                        </div>
                                        <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 text-center">
                                            <p className="text-3xl font-bold text-blue-600 mb-1">0</p>
                                            <p className="text-xs font-semibold text-blue-800 uppercase">Điểm tích lũy</p>
                                        </div>
                                        <div className="col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center gap-3"><Calendar className="w-5 h-5 text-gray-400" /><span className="text-sm text-gray-600">Ngày tham gia</span></div>
                                            <span className="font-medium text-slate-800">{new Date().toLocaleDateString('vi-VN')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. Tab Address */}
                        {activeTab === 'address' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-3xl">
                                <div className="mb-6 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-slate-800 border-l-4 border-green-500 pl-3">Địa chỉ nhận hàng</h3>
                                </div>
                                <AddressList mode="management" />
                            </div>
                        )}

                        {/* 3. TAB ORDERS */}
                        {activeTab === 'orders' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <h3 className="text-lg font-bold text-slate-800 border-l-4 border-purple-500 pl-3">Lịch sử đơn hàng</h3>

                                    {/* BỘ LỌC TRẠNG THÁI (SCROLLABLE ON MOBILE) */}
                                    <div className="flex gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">
                                        {ORDER_STATUSES.map(st => (
                                            <button
                                                key={st.id}
                                                onClick={() => setOrderStatus(st.id)}
                                                className={cn(
                                                    "px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap",
                                                    orderStatus === st.id
                                                        ? "bg-primary text-white shadow-md shadow-blue-200"
                                                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                                                )}
                                            >
                                                {st.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {ordersLoading ? (
                                    <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary mx-auto"></div></div>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">Không tìm thấy đơn hàng nào.</p>
                                    </div>
                                ) : (
                                    orders.map(order => (
                                        <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition">
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 border-b border-gray-100 pb-4">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="font-bold text-lg text-slate-800">Đơn hàng #{order.id}</span>
                                                        {renderStatusBadge(order.status)}
                                                    </div>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {new Date(order.createdAt).toLocaleString('vi-VN')}
                                                    </p>
                                                </div>
                                                <div className="text-left md:text-right">
                                                    <p className="font-bold text-primary text-xl">{order.totalPrice.toLocaleString('vi-VN')} đ</p>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 uppercase mt-1">
                                                        <CreditCard className="w-3 h-3" />
                                                        {order.paymentMethod} {order.paymentMethod === 'VNPAY' ? `- ${order.paymentStatus}` : ''}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-sm text-gray-600 mb-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                                                <p><span className="font-medium text-gray-800">Người nhận:</span> {order.customerName} - {order.customerPhoneNumber}</p>
                                                <p><span className="font-medium text-gray-800">Địa chỉ:</span> {order.customerAddress}</p>
                                            </div>

                                            <div className="flex justify-end gap-3 pt-2">
                                                {/* Nút Hủy & Thanh toán lại (Giữ nguyên logic cũ) */}
                                                {order.status === 'PENDING' && (
                                                    <button onClick={() => handleCancelOrder(order.id)} className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition">Hủy đơn</button>
                                                )}
                                                {order.paymentMethod === 'VNPAY' && order.paymentStatus === 'PENDING' && order.status !== 'CANCELLED' && (
                                                    <button onClick={() => handleRepay(order.id)} className="px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-blue-600 rounded-lg transition">Thanh toán ngay</button>
                                                )}

                                                {/* Nút Xem chi tiết */}
                                                <button
                                                    onClick={() => handleViewDetail(order)}
                                                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition"
                                                >
                                                    <Eye className="w-4 h-4" /> Xem chi tiết
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* 4. Tab Ví Voucher */}
                        {activeTab === 'vouchers' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <h3 className="text-lg font-bold text-slate-800 border-l-4 border-orange-500 pl-3 mb-6">Mã giảm giá của tôi</h3>

                                {vouchersLoading ? (
                                    <div className="text-center py-10">Đang tải voucher...</div>
                                ) : myVouchers.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                        <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">Bạn chưa có voucher nào.</p>
                                        <Link to="/vouchers" className="text-primary hover:underline mt-2 inline-block text-sm">Săn voucher ngay</Link>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {myVouchers.filter(v => !v.used).map(v => (
                                            <VoucherCard key={v.id} voucher={v} isOwned={true} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                    </div>

                </div>
            </div>

            {/* --- MODALS SECTION --- */}
            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
            />

            <EditProfileModal
                isOpen={isEditProfileOpen}
                onClose={() => setIsEditProfileOpen(false)}
                currentUser={profile}
                onSuccess={fetchProfile}
            />

            {/* MODAL CHI TIẾT ĐƠN HÀNG */}
            <OrderDetailModal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                order={selectedOrder}
            />
        </div>
    );
};

export default Profile;