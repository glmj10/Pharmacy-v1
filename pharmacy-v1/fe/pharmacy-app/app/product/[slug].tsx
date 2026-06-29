import React, { useEffect, useState } from 'react';
import { 
  View, Text, Image, ScrollView, TouchableOpacity, 
  ActivityIndicator, useWindowDimensions, Platform, Alert, FlatList 
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Redux & Actions
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { 
  fetchProductDetail, 
  fetchRelatedProducts, 
  fetchProductReviews, 
  clearCurrentProduct 
} from '../../src/store/productSlice';
import { addToCart } from '../../src/store/cartSlice';

// Components
import { CustomButton } from '../../src/components/CustomButton';
import { DescriptionModal } from '../../src/components/DescriptionModal';
import { ProductCard } from '../../src/components/ProductCard';
import ReviewSection from '../../src/components/product/ReviewSection';

// --- HELPER: Xử lý URL ảnh (Fix lỗi Android Emulator) ---
const getImageUrl = (url?: string) => {
  if (!url) return null;
  if (Platform.OS === 'android' && url.includes('localhost')) {
    return url.replace('localhost', '10.0.2.2');
  }
  return url;
};

// --- COMPONENT CON: Dòng thông tin ---
const InfoRow = ({ label, value, isLast = false }: { label: string, value?: string | number, isLast?: boolean }) => {
  if (!value) return null;
  return (
    <View className={`flex-row py-3 ${!isLast ? 'border-b border-gray-100' : ''}`}>
      <Text className="text-gray-500 font-medium w-32">{label}</Text>
      <Text className="flex-1 text-gray-800 font-medium">{String(value)}</Text>
    </View>
  );
};

// --- COMPONENT CON: Tiêu đề Section ---
const SectionTitle = ({ title, icon }: { title: string, icon: keyof typeof Ionicons.glyphMap }) => (
  <View className="flex-row items-center mb-3 mt-2">
    <Ionicons name={icon} size={20} color="#2563EB" />
    <Text className="text-lg font-bold text-gray-900 ml-2">{title}</Text>
  </View>
);

export default function ProductDetailScreen() {
  const { slug } = useLocalSearchParams();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { width } = useWindowDimensions();
  
  // State Redux
  const { 
    currentProduct: product, 
    relatedProducts, 
    reviews, 
    loading 
  } = useAppSelector((state) => state.products);
  
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // State Local
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isDescModalVisible, setDescModalVisible] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // 1. Fetch Product Detail
  useEffect(() => {
    if (slug) {
      dispatch(fetchProductDetail(slug as string));
    }
    return () => {
      dispatch(clearCurrentProduct()); // Cleanup khi thoát
    };
  }, [slug]);

  // 2. Fetch Related & Reviews (Khi đã có ID)
  useEffect(() => {
    if (product?.id) {
      dispatch(fetchRelatedProducts(product.id));
      dispatch(fetchProductReviews(product.id));
    }
  }, [product?.id]);

  // --- LOGIC XỬ LÝ ẢNH ---
  const allImages: string[] = [];
  if (product) {
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((imgObj) => {
        if (imgObj.imageUrl) {
           const url = getImageUrl(imgObj.imageUrl);
           if (url) allImages.push(url); 
        }
      });
    }
    // Fallback: nếu không có images thì dùng thumbnail
    if (allImages.length === 0 && product.thumbnail) {
      const thumb = getImageUrl(product.thumbnail);
      if (thumb) allImages.push(thumb);
    }
  }

  // --- LOGIC GIỎ HÀNG ---
  const adjustQuantity = (val: number) => {
    if (quantity + val >= 1) setQuantity(quantity + val);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
        Alert.alert("Yêu cầu đăng nhập", "Bạn cần đăng nhập để mua hàng", [
            { text: "Để sau", style: "cancel" },
            { text: "Đăng nhập", onPress: () => router.push('/(auth)/login') }
        ]);
        return;
    }
    if (!product || product.quantity <= 0) return;

    setIsAddingToCart(true);
    try {
        await dispatch(addToCart({ productId: product.id, quantity })).unwrap();
        Alert.alert("Thành công", `Đã thêm ${quantity} sản phẩm vào giỏ hàng`, [
            { text: "Tiếp tục xem", style: "cancel" },
            { text: "Đến giỏ hàng", onPress: () => router.push('/(tabs)/cart') }
        ]);
    } catch (error: any) {
        Alert.alert("Lỗi", error || "Không thể thêm vào giỏ");
    } finally {
        setIsAddingToCart(false);
    }
  };

  // --- RENDER LOADING ---
  if (loading || !product) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen 
        options={{ 
          title: 'Chi tiết sản phẩm',
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/(tabs)/cart')}>
              <Ionicons name="cart-outline" size={24} color="#374151" />
            </TouchableOpacity>
          )
        }} 
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* 1. SLIDER ẢNH */}
        <View className="relative bg-white">
          <ScrollView
            horizontal
            pagingEnabled={allImages.length > 1}
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const slide = Math.ceil(e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width);
              if (slide !== activeImageIndex) setActiveImageIndex(slide);
            }}
            scrollEventThrottle={16}
          >
            {allImages.length > 0 ? (
              allImages.map((imgUrl, index) => (
                <View key={index} style={{ width, height: 300 }} className="items-center justify-center p-4">
                  <Image source={{ uri: imgUrl }} className="w-full h-full" resizeMode="contain" />
                </View>
              ))
            ) : (
              <View style={{ width, height: 300 }} className="items-center justify-center bg-gray-50">
                <Ionicons name="image-outline" size={80} color="#D1D5DB" />
              </View>
            )}
          </ScrollView>
          
          {/* Dots Indicator (Chỉ hiện nếu > 1 ảnh) */}
          {allImages.length > 1 && (
            <View className="absolute bottom-4 flex-row w-full justify-center gap-2">
              {allImages.map((_, i) => (
                <View key={i} className={`w-2 h-2 rounded-full ${i === activeImageIndex ? 'bg-blue-600' : 'bg-gray-300'}`} />
              ))}
            </View>
          )}
        </View>

        <View className="p-4 bg-white">
          {/* 2. HEADER INFO (Tên, Giá, Badge) */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-gray-900 mb-2">{product.title}</Text>

            <View className="flex-row items-end mb-3">
              <Text className="text-3xl font-bold text-blue-600">
                {product.priceNew.toLocaleString('vi-VN')} đ
              </Text>
              {product.priceOld > product.priceNew && (
                <Text className="text-gray-400 line-through ml-3 mb-1.5 text-base">
                  {product.priceOld.toLocaleString('vi-VN')} đ
                </Text>
              )}
            </View>

            <View className="flex-row flex-wrap gap-2">
                {/* Badge Tồn kho */}
                <View className={`px-3 py-1 rounded-md ${product.quantity > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    <Text className={`text-xs font-bold ${product.quantity > 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {product.quantity > 0 ? `Còn ${product.quantity} sản phẩm` : 'Hết hàng'}
                    </Text>
                </View>
                {/* Badge Loại SP */}
                {product.productType && (
                    <View className="px-3 py-1 rounded-md bg-purple-50">
                        <Text className="text-xs font-bold text-purple-700">{product.productType}</Text>
                    </View>
                )}
            </View>
          </View>

          <View className="h-2 bg-gray-50 -mx-4 mb-6" />

          {/* 3. BẢNG THÔNG TIN CHI TIẾT */}
          <View className="mb-6">
             <SectionTitle title="Thông tin chi tiết" icon="list-outline" />
             <View className="bg-white rounded-xl border border-gray-100 px-4 py-2 shadow-sm">
                <InfoRow label="Hoạt chất" value={product.activeIngredient} />
                <InfoRow label="Dạng bào chế" value={product.dosageForm} />
                <InfoRow label="Quy cách" value={product.productType} />
                <InfoRow label="Nhà sản xuất" value={product.manufacturer} />
                <InfoRow label="Thương hiệu" value={product.brand?.name} />
                <InfoRow label="Số đăng ký" value={product.registrationNumber} />
                <InfoRow label="Tồn kho" value={product.quantity} />
                <InfoRow 
                    label="Danh mục" 
                    value={product.categories?.map(c => c.name).join(', ')} 
                    isLast 
                />
             </View>
          </View>

          {/* 4. CHỈ ĐỊNH */}
          {product.indication ? (
             <View className="mb-6">
                <SectionTitle title="Chỉ định" icon="medkit-outline" />
                <View className="bg-blue-50 p-4 rounded-xl">
                   <Text className="text-gray-800 leading-6">{product.indication}</Text>
                </View>
             </View>
          ) : null}

           {/* 5. MÔ TẢ (Preview + Modal) */}
           <View className="mb-6">
                <SectionTitle title="Mô tả sản phẩm" icon="document-text-outline" />
                <View className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <Text className="text-gray-500 leading-6 mb-3" numberOfLines={3}>
                        {product.description 
                            ? product.description.replace(/<[^>]*>?/gm, ' ').substring(0, 150) + '...'
                            : "Sản phẩm chưa có mô tả chi tiết."}
                    </Text>
                    {product.description && (
                        <TouchableOpacity 
                            onPress={() => setDescModalVisible(true)}
                            className="flex-row items-center justify-center py-2 bg-white rounded-lg border border-blue-200"
                        >
                            <Text className="text-blue-600 font-bold mr-1">Xem chi tiết mô tả</Text>
                            <Ionicons name="chevron-forward" size={16} color="#2563EB" />
                        </TouchableOpacity>
                    )}
                </View>
           </View>

           {/* 6. LƯU Ý */}
           {product.noted ? (
             <View className="mb-8">
                <SectionTitle title="Lưu ý khi sử dụng" icon="warning-outline" />
                <View className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                   <Text className="text-orange-800 leading-6">{product.noted}</Text>
                </View>
             </View>
           ) : null}

           {/* 7. ĐÁNH GIÁ (Reviews) */}
           <View className="mb-8 border-t border-gray-100 pt-2">
                <ReviewSection productId={product.id} />
           </View>

           {/* 8. SẢN PHẨM LIÊN QUAN */}
           {relatedProducts.length > 0 && (
              <View className="mb-10 border-t border-gray-100 pt-6">
                 <SectionTitle title="Sản phẩm liên quan" icon="grid-outline" />
                 <FlatList
                    horizontal
                    data={relatedProducts}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View className="w-44 mr-5 overflow-hidden">
                            <ProductCard product={item} style={{ width: '100%' }} />
                        </View>
                    )}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingRight: 16 }}
                 />
              </View>
           )}
        </View>
      </ScrollView>

      {/* 9. BOTTOM BAR (Sticky) */}
      <View className="px-4 py-3 bg-white border-t border-gray-100 pb-8 flex-row items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {/* Quantity Selector */}
        <View className="flex-row items-center bg-gray-50 rounded-xl mr-4 h-12 border border-gray-200">
            <TouchableOpacity 
                onPress={() => adjustQuantity(-1)} 
                className="px-3 h-full justify-center"
                disabled={quantity <= 1}
            >
                <Ionicons name="remove" size={20} color={quantity <= 1 ? "#D1D5DB" : "#4B5563"} />
            </TouchableOpacity>
            
            <Text className="font-bold text-lg w-8 text-center text-gray-900">{quantity}</Text>
            
            <TouchableOpacity onPress={() => adjustQuantity(1)} className="px-3 h-full justify-center">
                <Ionicons name="add" size={20} color="#4B5563" />
            </TouchableOpacity>
        </View>

        {/* Add to Cart Button */}
        <View className="flex-1">
            <CustomButton 
                title={product.quantity > 0 ? "Thêm vào giỏ" : "Hết hàng"}
                disabled={product.quantity <= 0 || isAddingToCart}
                isLoading={isAddingToCart}
                onPress={handleAddToCart}
            />
        </View>
      </View>

      {/* Modal Mô tả Full */}
      <DescriptionModal 
        visible={isDescModalVisible}
        onClose={() => setDescModalVisible(false)}
        content={product.description || ''}
        title={product.title}
      />
    </View>
  );
}