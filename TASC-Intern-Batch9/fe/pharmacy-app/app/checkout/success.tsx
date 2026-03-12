import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch } from '../../src/store/hooks';
import { resetOrderState } from '../../src/store/orderSlice';

export default function OrderSuccessScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(resetOrderState());
  }, []);

  const handleGoHome = () => {
    router.dismissAll();
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1 bg-white items-center justify-center p-6">
      <Stack.Screen options={{ headerShown: false }} />
      
      <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-6">
        <Ionicons name="checkmark" size={50} color="#16A34A" />
      </View>

      <Text className="text-2xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</Text>
      <Text className="text-gray-500 text-center mb-10">
        Cảm ơn bạn đã tin tưởng. Dược sĩ sẽ sớm liên hệ xác nhận đơn hàng của bạn.
      </Text>

      <TouchableOpacity 
        onPress={() => router.replace('/orders')}
        className="w-full border border-blue-600 py-3.5 rounded-xl items-center mb-3"
      >
        <Text className="text-blue-600 font-bold text-lg">Xem đơn hàng</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={handleGoHome}
        className="w-full bg-blue-600 py-3.5 rounded-xl items-center"
      >
        <Text className="text-white font-bold text-lg">Về trang chủ</Text>
      </TouchableOpacity>
    </View>
  );
}