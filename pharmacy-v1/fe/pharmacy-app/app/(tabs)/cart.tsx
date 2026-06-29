import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';

import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { 
  fetchCart, 
  updateCartQuantity, 
  toggleCartItem, 
  removeCartItem, 
  toggleAllItems,
  fetchTotalItems 
} from '../../src/store/cartSlice';
import { CartItem } from '../../src/components/CartItem';

export default function CartScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { items, totalPrice, loading } = useAppSelector((state) => state.cart);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (isAuthenticated) {
      await dispatch(fetchCart());
      dispatch(fetchTotalItems());
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [isAuthenticated])
  );

  // Auto-deselect items that are out of stock or inactive
  useEffect(() => {
    items.forEach(item => {
      if (item.selected && (item.isOutOfStock || item.product.active === false)) {
        dispatch(toggleCartItem({ itemId: item.id, selected: false }));
      }
    });
  }, [items.length]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
        <View className="bg-blue-50 p-6 rounded-full mb-6">
             <Ionicons name="cart-outline" size={60} color="#2563EB" />
        </View>
        <Text className="text-xl font-bold text-gray-900 mb-2">Giỏ hàng</Text>
        <Text className="text-gray-500 text-center mb-8">
            Vui lòng đăng nhập để xem giỏ hàng của bạn.
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

  const handleRemove = (id: number) => {
    Alert.alert("Xóa sản phẩm", "Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?", [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", style: "destructive", onPress: () => dispatch(removeCartItem(id)) }
    ]);
  };

  const allSelected = items.length > 0 && items.every(i => i.selected);

  const handleCheckout = () => {
    const hasSelected = items.some(i => i.selected);
    if (!hasSelected) {
        Alert.alert("Thông báo", "Vui lòng chọn ít nhất 1 sản phẩm để thanh toán.");
        return;
    }
    router.push('/checkout');
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="px-4 py-3 bg-white border-b border-gray-100 flex-row items-center justify-between">
        <Text className="text-xl font-bold text-gray-900">Giỏ hàng ({items.length})</Text>
      </View>

      {/* List Items */}
      {loading && items.length === 0 && !refreshing ? (
        <View className="flex-1 items-center justify-center"><ActivityIndicator color="#2563EB" size="large" /></View>
      ) : (
        <FlatList
            data={items}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                <CartItem 
                    item={item}
                    onUpdateQuantity={(qty) => {
                        if (qty > 0) dispatch(updateCartQuantity({ itemId: item.id, quantity: qty }));
                    }}
                    onToggle={() => dispatch(toggleCartItem({ itemId: item.id, selected: !item.selected }))}
                    onRemove={() => handleRemove(item.id)}
                    onPress={() => router.push(`/product/${item.product.slug}`)}
                />
            )}
            contentContainerStyle={{ padding: 16, paddingBottom: 120 }} 
            
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} title="Kéo để làm mới..." />
            }

            ListEmptyComponent={
                <View className="items-center justify-center mt-20">
                    <Ionicons name="cart-outline" size={48} color="#D1D5DB" />
                    <Text className="text-gray-500 mt-4">Giỏ hàng trống</Text>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/products')} className="mt-4">
                        <Text className="text-blue-600 font-bold">Tiếp tục mua sắm</Text>
                    </TouchableOpacity>
                </View>
            }
        />
      )}

      {/* Bottom Bar (Thanh thanh toán) */}
      {items.length > 0 && (
        <View 
            style={{ 
                position: 'absolute', 
                bottom: 0,
                left: 0, 
                right: 0 
            }}
            className="bg-white border-t border-gray-100 p-4 shadow-lg pb-4" // Giảm pb-8 xuống pb-4 cho gọn
        >
            <View className="flex-row justify-between items-center mb-4">
                <TouchableOpacity 
                    className="flex-row items-center"
                    onPress={() => dispatch(toggleAllItems(!allSelected))}
                >
                    <Ionicons 
                        name={allSelected ? "checkbox" : "square-outline"} 
                        size={24} 
                        color={allSelected ? "#2563EB" : "#9CA3AF"} 
                    />
                    <Text className="ml-2 text-gray-600 font-medium">Tất cả</Text>
                </TouchableOpacity>

                <View className="items-end">
                    <Text className="text-gray-500 text-xs">Tổng thanh toán</Text>
                    {/* Đổi màu giá tiền sang đỏ cho đồng bộ */}
                    <Text className="text-xl font-bold text-red-600"> 
                        {totalPrice.toLocaleString('vi-VN')}đ
                    </Text>
                </View>
            </View>

            {/* --- 3. ĐỔI MÀU NÚT SANG ĐỎ (bg-red-600) --- */}
            <TouchableOpacity 
                onPress={handleCheckout}
                className="bg-red-600 w-full py-3.5 rounded-xl items-center shadow-sm"
            >
                <Text className="text-white font-bold text-lg">Mua Hàng ({items.filter(i => i.selected).length})</Text>
            </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}