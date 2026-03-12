import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../src/store/hooks';
import {
  fetchWishlist,
  removeFromWishlist,
  clearWishlist,
} from '../src/store/wishlistSlice';
import { ProductCard } from '../src/components/ProductCard';
import { Product } from '../src/types/product';

export default function WishlistScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const isLoadingMoreRef = useRef(false);

  const { items, loading, actionLoading, totalPages, currentPage, totalElements } =
    useAppSelector((state) => state.wishlist);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist({ pageIndex: 1 }));
    }
  }, [isAuthenticated]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await dispatch(fetchWishlist({ pageIndex: 1 }));
    setIsRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (loading || currentPage >= totalPages || isLoadingMoreRef.current) return;
    isLoadingMoreRef.current = true;
    await dispatch(fetchWishlist({ pageIndex: currentPage + 1 }));
    isLoadingMoreRef.current = false;
  };

  const handleRemoveItem = (product: Product) => {
    Alert.alert(
      'Xóa khỏi yêu thích',
      `Bạn muốn xóa "${product.title}" khỏi danh sách yêu thích?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(removeFromWishlist([product.id])).unwrap();
            } catch (error: any) {
              Alert.alert('Lỗi', error || 'Không thể xóa sản phẩm');
            }
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    if (items.length === 0) return;
    Alert.alert(
      'Xóa tất cả',
      'Bạn có chắc muốn xóa toàn bộ danh sách yêu thích?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa tất cả',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(clearWishlist()).unwrap();
            } catch (error: any) {
              Alert.alert('Lỗi', error || 'Không thể xóa danh sách');
            }
          },
        },
      ]
    );
  };

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <View className="relative">
        <ProductCard product={item} />
        {/* Nút xóa nhanh */}
        <TouchableOpacity
          onPress={() => handleRemoveItem(item)}
          className="absolute top-2 right-2 w-7 h-7 bg-red-50 rounded-full items-center justify-center border border-red-100 z-10"
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons name="trash-outline" size={14} color="#EF4444" />
        </TouchableOpacity>
      </View>
    ),
    [items]
  );

  const renderFooter = () => {
    if (loading && currentPage > 1) {
      return (
        <View className="py-6 items-center">
          <ActivityIndicator size="small" color="#2563EB" />
        </View>
      );
    }
    if (!loading && items.length > 0 && currentPage >= totalPages) {
      return (
        <View className="py-6 items-center">
          <Text className="text-gray-400 text-xs">Đã hiển thị tất cả sản phẩm</Text>
        </View>
      );
    }
    return <View className="h-6" />;
  };

  // --- Chưa đăng nhập ---
  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Yêu thích</Text>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="heart-outline" size={64} color="#E5E7EB" />
          <Text className="text-xl font-bold text-gray-900 mt-4 mb-2">
            Bạn chưa đăng nhập
          </Text>
          <Text className="text-gray-500 text-center mb-8">
            Đăng nhập để lưu và quản lý danh sách sản phẩm yêu thích của bạn.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            className="w-full bg-blue-600 py-3.5 rounded-xl items-center"
          >
            <Text className="text-white font-bold text-lg">Đăng Nhập</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Yêu thích</Text>
          {totalElements > 0 && (
            <View className="ml-2 bg-blue-100 px-2 py-0.5 rounded-full">
              <Text className="text-blue-600 text-xs font-semibold">{totalElements}</Text>
            </View>
          )}
        </View>

        {items.length > 0 && (
          <TouchableOpacity
            onPress={handleClearAll}
            disabled={actionLoading}
            className="flex-row items-center"
          >
            {actionLoading ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
                <Text className="text-red-500 text-sm ml-1 font-medium">Xóa tất cả</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Loading ban đầu */}
      {loading && currentPage === 1 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
          <Text className="text-gray-400 mt-3">Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={items}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 24,
          }}
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#2563EB']}
              tintColor="#2563EB"
            />
          }
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View className="items-center justify-center mt-24">
              <Ionicons name="heart-outline" size={72} color="#E5E7EB" />
              <Text className="text-lg font-semibold text-gray-700 mt-4">
                Danh sách yêu thích trống
              </Text>
              <Text className="text-gray-400 text-center mt-2 px-8">
                Nhấn vào biểu tượng ❤️ trên sản phẩm để thêm vào yêu thích.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/products')}
                className="mt-6 bg-blue-600 px-8 py-3 rounded-xl"
              >
                <Text className="text-white font-semibold">Khám phá sản phẩm</Text>
              </TouchableOpacity>
            </View>
          }
          removeClippedSubviews
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
        />
      )}
    </SafeAreaView>
  );
}
