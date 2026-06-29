import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order, OrderStatus } from '../types';

// Helper: Format ngày tháng
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

// Helper: Config màu sắc theo trạng thái
const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'PENDING': return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Chờ xác nhận' };
    case 'SHIPPING': return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Đang vận chuyển' };
    case 'DELIVERED': return { bg: 'bg-green-100', text: 'text-green-700', label: 'Hoàn thành' };
    case 'CANCELLED': return { bg: 'bg-red-100', text: 'text-red-700', label: 'Đã hủy' };
    case 'FAILED': return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Thất bại' };
    default: return { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
  }
};

interface OrderCardProps {
  order: Order;
  onPress: () => void;
  onRepay?: (id: number) => void;
}

export const OrderCard = ({ order, onPress, onRepay }: OrderCardProps) => {
  const statusConfig = getStatusColor(order.status);
  
  // Logic hiển thị nút Repay: VNPAY + PENDING + Không phải Cancelled
  const showRepay = order.paymentMethod === 'VNPAY' && 
                    order.paymentStatus === 'PENDING' && 
                    order.status !== 'CANCELLED';

  return (
    <View className="bg-white rounded-xl mb-3 border border-gray-100 shadow-sm overflow-hidden">
        <TouchableOpacity 
            onPress={onPress}
            activeOpacity={0.7}
            className="p-4"
        >
            {/* Header: ID & Status */}
            <View className="flex-row justify-between items-center mb-3 border-b border-gray-50 pb-2">
                <Text className="font-bold text-gray-800">Đơn hàng #{order.id}</Text>
                <View className={`px-2 py-1 rounded ${statusConfig.bg}`}>
                    <Text className={`text-xs font-bold ${statusConfig.text}`}>
                        {statusConfig.label}
                    </Text>
                </View>
            </View>

            {/* Body: Info */}
            <View className="flex-row items-center mb-2">
                <Ionicons name="time-outline" size={16} color="#9CA3AF" />
                <Text className="text-gray-500 text-xs ml-1">{formatDate(order.createdAt)}</Text>
            </View>
            
            <View className="flex-row items-start mb-2">
                <Ionicons name="location-outline" size={16} color="#9CA3AF" />
                <Text className="text-gray-600 text-xs ml-1 flex-1" numberOfLines={1}>
                    {order.customerAddress}
                </Text>
            </View>

            {/* Footer: Price & Method */}
            <View className="flex-row justify-between items-end mt-2">
                <View>
                    <Text className="text-gray-400 text-xs">Phương thức</Text>
                    <Text className="text-gray-700 font-medium text-xs">{order.paymentMethod}</Text>
                    <View className={`mt-1 self-start px-2 py-0.5 rounded-full ${order.paymentStatus === 'COMPLETED' ? 'bg-green-100' : 'bg-orange-100'}`}>
                        <Text className={`text-xs font-semibold ${order.paymentStatus === 'COMPLETED' ? 'text-green-700' : 'text-orange-700'}`}>
                            {order.paymentStatus === 'COMPLETED' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                        </Text>
                    </View>
                </View>
                <View className="items-end">
                    <Text className="text-gray-400 text-xs">Tổng tiền</Text>
                    <Text className="text-red-600 font-bold text-base">
                        {order.totalPrice.toLocaleString('vi-VN')}đ
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
        
        {/* Repay Button Section */}
        {showRepay && onRepay && (
            <View className="px-4 pb-4 border-t border-gray-50 pt-3">
                 <TouchableOpacity 
                    onPress={() => onRepay(order.id)}
                    className="bg-blue-600 py-3 rounded-lg items-center flex-row justify-center gap-2"
                 >
                    <Ionicons name="card-outline" size={18} color="white" />
                    <Text className="text-white font-bold text-sm">Thanh toán ngay (VNPAY)</Text>
                 </TouchableOpacity>
            </View>
        )}
    </View>
  );
};