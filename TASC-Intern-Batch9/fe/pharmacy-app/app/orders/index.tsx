import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { fetchMyOrders, clearOrderList } from '../../src/store/orderSlice';
import { OrderCard } from '../../src/components/OrderCard';
import paymentService from '../../src/api/paymentService';

// Danh sách Tabs trạng thái
const STATUS_TABS = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'PENDING', label: 'Chờ xác nhận' },
  { id: 'SHIPPING', label: 'Vận chuyển' },
  { id: 'DELIVERED', label: 'Hoàn thành' },
  { id: 'CANCELLED', label: 'Đã hủy' },
];

export default function OrdersScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { orderList, loading, totalPages } = useAppSelector((state) => state.orders);

  const [activeStatus, setActiveStatus] = useState('ALL');
  const [page, setPage] = useState(1);

  // Load data khi tab hoặc page thay đổi
  useEffect(() => {
    // Nếu đổi tab thì reset list trước (để tránh hiện data cũ của tab khác)
    if (page === 1) dispatch(clearOrderList());
    
    dispatch(fetchMyOrders({ 
        pageIndex: page, 
        status: activeStatus 
    }));
  }, [activeStatus, page]);

  // Handle đổi Tab
  const handleTabChange = (statusId: string) => {
    if (statusId !== activeStatus) {
      setActiveStatus(statusId);
      setPage(1); // Reset về trang 1
    }
  };

  // Handle Load More
  const handleLoadMore = () => {
    if (!loading && page < totalPages) {
      setPage(prev => prev + 1);
    }
  };

  const handleRepay = async (orderId: number) => {
    try {
        const res: any = await paymentService.repayOrder(orderId);
        // Với pharmacy-app axiosClient trả full response, data nằm trong res.data
        // Cấu trúc ApiResponse thường là { result: { paymentUrl: ... } } hoặc trực tiếp
        // Ta check an toàn các trường hợp
        const apiResponse = res.data;
        // The actual data might be string (URL) or object
        const payload = apiResponse?.data;
        
        let paymentUrl = "";
        if (typeof payload === 'string') {
            paymentUrl = payload;
        } else {
            paymentUrl = payload?.paymentUrl || payload?.result?.paymentUrl;
        }
        
        if (paymentUrl) {
           router.push({ pathname: '/checkout/payment', params: { url: paymentUrl } });
        } else {
            Alert.alert("Thông báo", "Không lấy được link thanh toán từ hệ thống.");
        }
    } catch (error: any) {
        console.error("Repay Error:", error);
        Alert.alert("Lỗi", error.response?.data?.message || "Có lỗi xảy ra khi tạo thanh toán.");
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <OrderCard 
        order={item} 
        onPress={() => {
            router.push(`/orders/${item.id}`);
        }}
        onRepay={handleRepay}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* 1. Header */}
      <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Đơn mua của tôi</Text>
      </View>

      {/* 2. Status Tabs (Scroll ngang) */}
      <View className="bg-white pb-2">
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={{ paddingHorizontal: 16 }}
            className="mt-2"
        >
            {STATUS_TABS.map((tab) => (
                <TouchableOpacity
                    key={tab.id}
                    onPress={() => handleTabChange(tab.id)}
                    className={`mr-3 px-4 py-2 rounded-full border ${
                        activeStatus === tab.id 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'bg-white border-gray-200'
                    }`}
                >
                    <Text className={`text-sm font-medium ${
                        activeStatus === tab.id ? 'text-white' : 'text-gray-600'
                    }`}>
                        {tab.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
      </View>

      {/* 3. Order List */}
      <FlatList
        data={orderList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        
        ListFooterComponent={loading ? <ActivityIndicator className="mt-4" color="#2563EB" /> : null}
        
        ListEmptyComponent={!loading ? (
            <View className="items-center justify-center mt-20">
                <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                    <Ionicons name="receipt-outline" size={40} color="#D1D5DB" />
                </View>
                <Text className="text-gray-500">Chưa có đơn hàng nào</Text>
            </View>
        ) : null}
      />
    </SafeAreaView>
  );
}
