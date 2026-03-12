import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, ViewStyle, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';
import { useAppDispatch, useAppSelector } from '../store/hooks'; // <--- Import Hooks
import { addToCart } from '../store/cartSlice'; // <--- Import Action
import { addToWishlist, removeFromWishlist } from '../store/wishlistSlice';

const { width } = Dimensions.get('window');
const PADDING_HORIZONTAL = 16;
const GAP = 12;
const GRID_WIDTH = (width - (PADDING_HORIZONTAL * 2) - GAP) / 2;

interface ProductCardProps {
  product: Product;
  style?: ViewStyle;
}

export const ProductCard = ({ product, style }: ProductCardProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  // Lấy trạng thái đăng nhập
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Trạng thái yêu thích cục bộ (khởi tạo từ dữ liệu sản phẩm)
  const [isWishlisted, setIsWishlisted] = useState(product.inWishlist ?? false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const handlePress = () => {
    if (product.slug) router.push(`/product/${product.slug}`);
  };

  // --- LOGIC WISHLIST ---
  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để thêm vào yêu thích', [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng nhập', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }

    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await dispatch(removeFromWishlist([product.id])).unwrap();
        setIsWishlisted(false);
      } else {
        await dispatch(addToWishlist(product.id)).unwrap();
        setIsWishlisted(true);
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error || 'Không thể cập nhật danh sách yêu thích');
    } finally {
      setWishlistLoading(false);
    }
  };
  // ----------------------

  // --- LOGIC THÊM VÀO GIỎ ---
  const handleAddToCart = async () => {
    // 1. Check Login
    if (!isAuthenticated) {
      Alert.alert("Thông báo", "Vui lòng đăng nhập để mua hàng", [
        { text: "Hủy", style: "cancel" },
        { text: "Đăng nhập", onPress: () => router.push('/(auth)/login') }
      ]);
      return;
    }

    // 2. Check tồn kho
    if (product.quantity <= 0) {
        Alert.alert("Thông báo", "Sản phẩm này đã hết hàng");
        return;
    }

    try {
      // 3. Gọi API thêm 1 sản phẩm
      await dispatch(addToCart({ productId: product.id, quantity: 1 })).unwrap();
      Alert.alert("Thành công", "Đã thêm vào giỏ hàng");
    } catch (error: any) {
      Alert.alert("Lỗi", error || "Không thể thêm vào giỏ");
    }
  };
  // -------------------------

  const getImageUrl = (url?: string) => {
    if (!url) return null;
    if (url.includes('localhost')) return url.replace('localhost', '10.0.2.2');
    return url;
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      style={[{ width: GRID_WIDTH }, style]} 
      className="bg-white rounded-xl border border-blue-50 shadow-sm overflow-hidden mb-3"
      activeOpacity={0.7}
    >
      {/* ... (Phần hiển thị ảnh giữ nguyên) ... */}
      <View className="h-36 w-full items-center justify-center bg-blue-50/30 p-2 relative">
         {product.thumbnail ? (
           <Image source={{ uri: getImageUrl(product.thumbnail) || undefined }} className="w-full h-full" resizeMode="contain" />
         ) : (
           <Ionicons name="image-outline" size={40} color="#BFDBFE" />
         )}
         {product.quantity <= 0 && (
            <View className="absolute top-2 left-2 bg-gray-500/80 px-2 py-1 rounded">
                <Text className="text-[10px] text-white font-bold">Hết hàng</Text>
            </View>
         )}
         {/* Nút Yêu thích */}
         <TouchableOpacity
           onPress={handleToggleWishlist}
           disabled={wishlistLoading}
           className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full items-center justify-center shadow-sm"
           hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
         >
           <Ionicons
             name={isWishlisted ? 'heart' : 'heart-outline'}
             size={16}
             color={isWishlisted ? '#EF4444' : '#9CA3AF'}
           />
         </TouchableOpacity>
      </View>

      <View className="p-3">
        {/* ... (Phần Tên & Hoạt chất giữ nguyên) ... */}
        <View className="h-10 justify-start">
            <Text numberOfLines={2} className="text-sm font-medium text-gray-800 leading-5">{product.title}</Text>
        </View>
        <Text numberOfLines={1} className="text-xs text-gray-400 mt-1 mb-2 h-4">{product.activeIngredient || ' '}</Text>
        
        <View className="flex-row items-center justify-between mt-auto">
            <View>
                <Text className="text-blue-600 font-bold text-base">
                    {product.priceNew.toLocaleString('vi-VN')}đ
                </Text>
            </View>
            
            {/* --- NÚT THÊM VÀO GIỎ --- */}
            <TouchableOpacity 
                onPress={handleAddToCart} // Gắn hàm xử lý vào đây
                disabled={product.quantity <= 0}
                className={`p-1.5 rounded-full ${product.quantity > 0 ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
                <Ionicons name="add" size={18} color="white" />
            </TouchableOpacity>
            {/* ----------------------- */}
        </View>
      </View>
    </TouchableOpacity>
  );
};