import React from 'react';
import { View, Text, Image, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartItem as CartItemType } from '../types/cart';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (newQty: number) => void;
  onToggle: () => void;
  onRemove: () => void;
  onPress?: () => void;
}

export const CartItem = ({ item, onUpdateQuantity, onToggle, onRemove, onPress }: CartItemProps) => {
  const isUnavailable = item.isOutOfStock || item.product.active === false;
  const getImageUrl = (url?: string) => {
    if (!url) return undefined;
    if (Platform.OS === 'android' && url.includes('localhost')) {
      return url.replace('localhost', '10.0.2.2');
    }
    return url;
  };

  return (
    <View className={`flex-row items-center bg-white p-3 mb-3 rounded-xl border border-gray-100 shadow-sm ${isUnavailable ? 'opacity-60' : ''}`}>
      {/* Checkbox */}
      <TouchableOpacity onPress={isUnavailable ? undefined : onToggle} className="mr-3 p-1" disabled={isUnavailable}>
        <Ionicons 
          name={item.selected && !isUnavailable ? "checkbox" : "square-outline"} 
          size={24} 
          color={item.selected && !isUnavailable ? "#2563EB" : "#9CA3AF"} 
        />
      </TouchableOpacity>

      {/* Ảnh + Info (clickable) */}
      <TouchableOpacity className="flex-row flex-1 items-center" onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>

      {/* Ảnh */}
      <View className="w-20 h-20 bg-gray-50 rounded-lg items-center justify-center border border-gray-200 mr-3">
        {item.product.thumbnailUrl ? (
          <Image 
            source={{ uri: getImageUrl(item.product.thumbnailUrl) }} 
            className="w-full h-full rounded-lg" 
            resizeMode="contain" 
          />
        ) : (
          <Ionicons name="image-outline" size={24} color="#D1D5DB" />
        )}
      </View>

      {/* Info */}
      <View className="flex-1 justify-between h-20">
        <View>
            <Text numberOfLines={2} className="text-sm font-medium text-gray-800 leading-5">
                {item.product.title}
            </Text>
            {item.isOutOfStock && (
                <Text className="text-xs text-red-500 font-bold mt-1">Hết hàng</Text>
            )}
            {!item.isOutOfStock && item.product.active === false && (
                <Text className="text-xs text-orange-500 font-bold mt-1">Tạm ngừng kinh doanh</Text>
            )}
        </View>

        <View className="flex-row justify-between items-center">
            <Text className="text-blue-600 font-bold">
                {item.product.priceNew.toLocaleString('vi-VN')}đ
            </Text>

            {/* Quantity Control */}
            <View className="flex-row items-center bg-gray-50 rounded-lg border border-gray-200 h-8">
                <TouchableOpacity 
                    onPress={() => onUpdateQuantity(item.quantity - 1)}
                    className="px-2 border-r border-gray-200 h-full justify-center"
                >
                    <Text className="text-gray-600">-</Text>
                </TouchableOpacity>
                <Text className="px-3 font-medium text-gray-800">{item.quantity}</Text>
                <TouchableOpacity 
                    onPress={() => onUpdateQuantity(item.quantity + 1)}
                    className="px-2 border-l border-gray-200 h-full justify-center"
                >
                    <Text className="text-gray-600">+</Text>
                </TouchableOpacity>
            </View>
        </View>
      </View>

      </TouchableOpacity>{/* end clickable area */}

      {/* Delete Button */}
      <TouchableOpacity onPress={onRemove} className="absolute top-2 right-2 p-1">
         <Ionicons name="close" size={18} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  );
};