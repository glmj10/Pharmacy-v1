import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert, SafeAreaView, StatusBar, ImageBackground } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import voucherService from '../../src/api/voucherService';
import VoucherCard from '../../src/components/voucher/VoucherCard';
import { Voucher } from '../../src/types/voucher';

const VoucherScreen = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchVouchers();
  }, []);

  function mapVoucherResponse(res: any): Voucher {
    return {
        id: res.id,
        code: res.code,
        description: res.description,
        type: res.type,
        discountType: res.discountType,
        discountValue: res.discountValue,
        startDate: res.startDate,
        endDate: res.endDate,
        claimed: res.claimed || false,
        used: res.used || false,
        maxDiscountAmount: res.maxDiscountAmount,
        minOrderValue: res.minOrderValue,
        usageLimit: res.usageLimit,
        usageLimitPerUser: res.usageLimitPerUser,
        status: res.status
    };
  }

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await voucherService.getVouchers();
      if (res.data && res.data.data && Array.isArray(res.data.data.content)) {
        setVouchers(res.data.data.content.map(mapVoucherResponse));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (id: number) => {
    try {
      await voucherService.claimVoucher({ voucherId: id });
      Alert.alert('Thành công', 'Đã lưu voucher vào ví của bạn');
      // Update local state to show claimed status
      setVouchers(prev => prev.map(v => v.id === id ? { ...v, claimed: true } : v));
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu voucher này');
    }
  };

  const handleUse = (voucher: Voucher) => {
     router.push('/(tabs)/products');
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />

      {/* HEADER BANNER */}
      <View className="bg-orange-500 pt-12 pb-6 px-4 relative overflow-hidden">
         {/* Decoration Circles */}
         <View className="absolute top-0 right-0 w-32 h-32 bg-orange-400 rounded-full -mr-10 -mt-10 opacity-50" />
         <View className="absolute bottom-0 left-0 w-24 h-24 bg-orange-400 rounded-full -ml-8 -mb-8 opacity-50" />

         <View className="flex-row items-center mb-4">
             <TouchableOpacity onPress={() => router.back()} className="p-1 bg-white/20 rounded-full mr-3">
                 <Ionicons name="arrow-back" size={24} color="white" />
             </TouchableOpacity>
             <Text className="text-white text-lg font-bold">Kho Voucher</Text>
         </View>

         <View className="items-center mt-2 mb-4">
             <View className="bg-white/20 p-3 rounded-full mb-3">
                 <Ionicons name="ticket-outline" size={32} color="white" />
             </View>
             <Text className="text-white text-2xl font-bold">Săn Mã Giảm Giá</Text>
             <Text className="text-orange-100 mt-1">Săn mã giảm giá, freeship mỗi ngày</Text>
         </View>
      </View>
      
      {/* CONTENT LIST */}
      {loading ? (
        <View className="flex-1 justify-center items-center mt-10">
            <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : (
        <FlatList
          data={vouchers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View className={item.used ? 'opacity-50' : ''}>
              <VoucherCard 
                  voucher={item} 
                  onClaim={handleClaim} 
                  onUse={handleUse}
                  claimed={item.claimed}
                  isMyVoucher={false}
                  statusBadge={
                    item.used ? (
                      <View className="bg-gray-100 px-2 py-0.5 rounded-full">
                        <Text className="text-gray-500 text-[10px] font-semibold">Đã sử dụng</Text>
                      </View>
                    ) : undefined
                  }
              />
            </View>
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          ListEmptyComponent={
            <View className="items-center mt-20">
                <View className="bg-gray-100 p-6 rounded-full mb-4">
                    <Ionicons name="ticket-outline" size={48} color="#9CA3AF" />
                </View>
                <Text className="text-gray-500 font-medium">Hiện không có voucher nào</Text>
                <Text className="text-gray-400 text-sm mt-1">Quay lại sau bạn nhé!</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default VoucherScreen;
