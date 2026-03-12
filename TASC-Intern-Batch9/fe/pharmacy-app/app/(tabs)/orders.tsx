import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppSelector } from '../../src/store/hooks';

export default function OrderScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // --- NẾU CHƯA LOGIN ---
  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
        <View className="bg-blue-50 p-6 rounded-full mb-6">
             <Ionicons name="cart-outline" size={60} color="#2563EB" />
        </View>
        <Text className="text-xl font-bold text-gray-900 mb-2">Bạn chưa có đơn hàng nào</Text>
        <Text className="text-gray-500 text-center mb-8">
            Vui lòng đăng nhập để xem thông tin đơn hàng.
        </Text>
        <TouchableOpacity 
            onPress={() => router.push('/(auth)/login')}
            className="bg-blue-600 px-8 py-3 rounded-xl"
        >
            <Text className="text-white font-bold">Đăng nhập ngay</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <Text>Nội dung giỏ hàng (Đang phát triển)</Text>
    </SafeAreaView>
  );
}