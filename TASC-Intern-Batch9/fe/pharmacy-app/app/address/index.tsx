import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context'; // Import từ đây

import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { fetchAddresses, deleteAddress } from '../../src/store/addressSlice';

export default function AddressListScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.address);

  const handleEdit = (id: number) => {
    router.push({
      pathname: '/address/edit',
      params: { id: id }
    });
  };

  useEffect(() => {
    dispatch(fetchAddresses());
  }, []);

  const handleDelete = (id: number) => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn xóa địa chỉ này?", [
      { text: "Hủy", style: "cancel" },
      { text: "Xóa", style: "destructive", onPress: () => dispatch(deleteAddress(id)) }
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View className="bg-white p-4 mb-3 rounded-xl border border-gray-100 shadow-sm mx-4">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="font-bold text-gray-900 text-lg mr-2">{item.fullName}</Text>
            {item.isDefault && (
              <View className="bg-blue-100 px-2 py-0.5 rounded">
                <Text className="text-blue-700 text-[10px] font-bold">Mặc định</Text>
              </View>
            )}
          </View>
          <Text className="text-gray-500 mb-1">{item.phoneNumber}</Text>
          <Text className="text-gray-700 leading-5">{item.address}</Text>
        </View>

        <View className="flex-col gap-2">
          {/* 1. Nút Sửa (Mới) */}
          <TouchableOpacity
            onPress={() => handleEdit(item.id)}
            className="p-2 bg-gray-50 rounded-lg items-center justify-center"
          >
            <Ionicons name="pencil-outline" size={20} color="#2563EB" />
          </TouchableOpacity>

          {/* 2. Nút Xóa (Cũ) */}
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            className="p-2 bg-red-50 rounded-lg items-center justify-center"
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    // Sử dụng SafeAreaView và chỉ lấy cạnh đáy (bottom) để tránh tai thỏ phía trên (do Header đã lo rồi)
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top', 'bottom']}>

      {/* Cấu hình Header màu trắng đục để che nội dung khi lướt lên */}
      <Stack.Screen
        options={{
          title: "Sổ địa chỉ",
          headerBackTitle: "Trở lại",
          headerStyle: { backgroundColor: '#F8FAFC' }, // Màu nền header khớp với background
          headerShadowVisible: false // Bỏ gạch kẻ chân header cho đẹp
        }}
      />

      {loading && items.length === 0 ? (
        <View className="mt-10"><ActivityIndicator color="#2563EB" /></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          // Thêm padding trên (paddingTop) để item đầu tiên không dính sát header
          contentContainerStyle={{ paddingVertical: 16 }}
          ListEmptyComponent={
            <Text className="text-center text-gray-500 mt-10">Chưa có địa chỉ nào.</Text>
          }
        />
      )}

      {/* Nút Thêm Mới */}
      <TouchableOpacity
        onPress={() => router.push('/address/create')}
        className="absolute bottom-8 right-6 w-14 h-14 bg-blue-600 rounded-full items-center justify-center shadow-lg"
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}