import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import voucherService from '../../src/api/voucherService';
import VoucherCard from '../../src/components/voucher/VoucherCard';
import { Voucher } from '../../src/types/voucher';

export default function MyVoucherScreen() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchMyVouchers();
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
        maxDiscountAmount: res.maxDiscountAmount,
        minOrderValue: res.minOrderValue,
        usageLimit: res.usageLimit,
        usageLimitPerUser: res.usageLimitPerUser,
        status: res.status
    };
  }

  const fetchMyVouchers = async () => {
    setLoading(true);
    try {
      const res = await voucherService.getUserVouchers();
      if (res.data && res.data.data && Array.isArray(res.data.data.content)) {
        setVouchers(res.data.data.content.map(mapVoucherResponse));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUse = (voucher: Voucher) => {
     // Logic điều hướng khi dùng voucher
     // Có thể điều hướng về trang chủ hoặc trang sản phẩm tùy loại voucher
     router.push('/(tabs)/products'); 
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom', 'left', 'right']}>
      <Stack.Screen options={{ 
        title: "Ví Voucher",
        headerStyle: { backgroundColor: '#fff' },
        headerShadowVisible: false,
        headerTintColor: '#1F2937'
      }} />
      <StatusBar barStyle="dark-content" />

      {loading ? (
        <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={vouchers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <VoucherCard 
                voucher={item}
                isMyVoucher={true} // Chế độ hiển thị cho ví voucher
                onUse={handleUse}
                claimed={true} // Voucher trong ví thì chắc chắn đã claimed/nhận rồi
            />
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          ListEmptyComponent={
            <View className="items-center mt-20">
                <View className="bg-blue-50 p-6 rounded-full mb-4">
                    <Ionicons name="wallet-outline" size={48} color="#2563EB" />
                </View>
                <Text className="text-gray-900 font-bold text-lg">Ví voucher trống</Text>
                <Text className="text-gray-500 text-center mt-2 px-8">
                    Bạn chưa lưu voucher nào. Hãy săn voucher ngay để nhận ưu đãi nhé!
                </Text>
                <TouchableOpacity 
                    className="mt-6 bg-blue-600 px-6 py-2.5 rounded-full shadow-sm"
                    onPress={() => router.push('/vouchers')}
                >
                    <Text className="text-white font-bold">Săn Voucher Ngay</Text>
                </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
