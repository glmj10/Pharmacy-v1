import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { fetchOrderDetail, cancelOrder, clearCurrentOrder } from '../../src/store/orderSlice';
import { CustomButton } from '../../src/components/CustomButton';

// Helper màu sắc trạng thái
const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return { text: 'text-orange-600', label: 'Đang chờ xác nhận' };
    case 'SHIPPING': return { text: 'text-blue-600', label: 'Đang vận chuyển' };
    case 'DELIVERED': return { text: 'text-green-600', label: 'Giao hàng thành công' };
    case 'CANCELLED': return { text: 'text-red-600', label: 'Đã hủy' };
    default: return { text: 'text-gray-600', label: status };
  }
};

// Helper fix ảnh localhost android
const getImageUrl = (url?: string) => {
    if (!url) return undefined;
    if (Platform.OS === 'android' && url.includes('localhost')) return url.replace('localhost', '10.0.2.2');
    return url;
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Lấy thông tin Header đơn hàng từ list đã load trước đó
  const { orderList, currentOrderItems, loading } = useAppSelector((state) => state.orders);
  const orderInfo = orderList.find(o => o.id.toString() === id);

  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderDetail(Number(id)));
    }
    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [id]);

  const handleCancelOrder = () => {
    Alert.alert("Hủy đơn hàng", "Bạn có chắc chắn muốn hủy đơn hàng này?", [
        { text: "Không", style: "cancel" },
        { 
            text: "Hủy đơn", 
            style: "destructive", 
            onPress: async () => {
                setIsCancelling(true);
                try {
                    await dispatch(cancelOrder(Number(id))).unwrap();
                    Alert.alert("Thành công", "Đơn hàng đã được hủy.");
                    router.back();
                } catch (error: any) {
                    Alert.alert("Lỗi", error);
                } finally {
                    setIsCancelling(false);
                }
            }
        }
    ]);
  };

  if (!orderInfo) {
    return (
        <View className="flex-1 bg-white items-center justify-center">
            <Text>Không tìm thấy thông tin đơn hàng</Text>
        </View>
    );
  }

  const statusConfig = getStatusColor(orderInfo.status);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'bottom']}>
      <Stack.Screen options={{ title: `Đơn hàng #${id}`, headerBackTitle: "Trở lại" }} />

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        
        {/* 1. Trạng thái đơn hàng */}
        <View className="bg-white p-4 rounded-xl mb-3 shadow-sm border-l-4 border-l-blue-600">
            <Text className="text-gray-500 text-xs uppercase font-bold mb-1">Trạng thái đơn hàng</Text>
            <Text className={`text-lg font-bold ${statusConfig.text}`}>{statusConfig.label}</Text>
            <Text className="text-gray-400 text-xs mt-1">Ngày đặt: {new Date(orderInfo.createdAt).toLocaleString('vi-VN')}</Text>
        </View>

        {/* 2. Địa chỉ nhận hàng */}
        <View className="bg-white p-4 rounded-xl mb-3 shadow-sm">
            <View className="flex-row items-center mb-2">
                <Ionicons name="location-outline" size={20} color="#2563EB" />
                <Text className="font-bold text-gray-900 ml-2">Địa chỉ nhận hàng</Text>
            </View>
            <Text className="font-bold text-gray-800">{orderInfo.customerName}</Text>
            <Text className="text-gray-600 mt-1">{orderInfo.customerAddress}</Text>
        </View>

        {/* 3. Danh sách sản phẩm */}
        <View className="bg-white p-4 rounded-xl mb-3 shadow-sm">
            <Text className="font-bold text-gray-900 mb-3">Sản phẩm</Text>
            
            {loading && currentOrderItems.length === 0 ? (
                <ActivityIndicator color="#2563EB" />
            ) : (
                currentOrderItems.map((item) => (
                    <View key={item.id} className="flex-row mb-4 border-b border-gray-50 pb-4 last:border-0 last:pb-0 last:mb-0">
                        <Image 
                            source={{ uri: getImageUrl(item.product.thumbnailUrl) }} 
                            className="w-16 h-16 rounded-lg bg-gray-100" 
                            resizeMode="contain" 
                        />
                        <View className="flex-1 ml-3 justify-center">
                            <Text className="font-medium text-gray-800 text-sm" numberOfLines={2}>{item.product.title}</Text>
                            <View className="flex-row justify-between items-center mt-1">
                                <Text className="text-gray-500 text-xs">x{item.quantity}</Text>
                                <Text className="font-bold text-blue-600">{item.priceAtOrder.toLocaleString('vi-VN')}đ</Text>
                            </View>
                            
                            {/* Nút đánh giá (Chỉ hiện khi đã giao và chưa đánh giá) */}
                            {orderInfo.status === 'DELIVERED' && !item.rated && (
                                <TouchableOpacity className="mt-2 self-start bg-yellow-50 px-3 py-1 rounded border border-yellow-200">
                                    <Text className="text-yellow-700 text-xs font-bold">Đánh giá</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                ))
            )}
        </View>

        {/* 4. Thanh toán */}
        <View className="bg-white p-4 rounded-xl mb-20 shadow-sm">
            <View className="flex-row justify-between mb-2">
                <Text className="text-gray-500">Phương thức thanh toán</Text>
                <Text className="text-gray-900 font-medium">{orderInfo.paymentMethod}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
                <Text className="text-gray-500">Trạng thái thanh toán</Text>
                <Text className={`font-medium ${orderInfo.paymentStatus === 'COMPLETED' ? 'text-green-600' : 'text-orange-600'}`}>
                    {orderInfo.paymentStatus === 'COMPLETED' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </Text>
            </View>
            <View className="border-t border-dashed border-gray-200 my-2" />
            <View className="flex-row justify-between items-center">
                <Text className="text-lg font-bold text-gray-900">Tổng cộng</Text>
                <Text className="text-xl font-bold text-red-600">{orderInfo.totalPrice.toLocaleString('vi-VN')}đ</Text>
            </View>
        </View>

      </ScrollView>

      {/* Footer Actions */}
      {orderInfo.status === 'PENDING' && (
          <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-lg">
              <CustomButton 
                title="Hủy đơn hàng" 
                onPress={handleCancelOrder} 
                variant="outline"
                isLoading={isCancelling}
                // Bạn có thể custom style nút hủy thành màu đỏ trong component CustomButton hoặc style đè
              />
          </View>
      )}
    </SafeAreaView>
  );
}