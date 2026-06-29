import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, TextInput, RefreshControl, ActivityIndicator, TouchableOpacity, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { fetchProducts, fetchBrands, fetchCategories } from '../../src/store/productSlice';
import { ProductCard } from '../../src/components/ProductCard';
import { FilterModal } from '../../src/components/FilterModal';

export default function ProductCatalogScreen() {
  const dispatch = useAppDispatch();
  const flatListRef = useRef<FlatList>(null);
  
  const { items, loading, totalPages } = useAppSelector((state) => state.products);

  const [searchText, setSearchText] = useState('');
  const [currentFilters, setCurrentFilters] = useState<any>({});

  const [page, setPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchBrands());
    dispatch(fetchCategories());
    fetchData(1, '', {});
  }, []);

  const fetchData = async (pageIndex: number, title: string, filters: any) => {
    await dispatch(fetchProducts({ pageIndex, title, ...filters }));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setPage(1); 
    await fetchData(1, searchText, currentFilters);
    setIsRefreshing(false);
  };

  const isLoadingMoreRef = useRef(false);

  const handleLoadMore = async () => {
    if (loading || page >= totalPages || isLoadingMoreRef.current) return;

    isLoadingMoreRef.current = true;
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchData(nextPage, searchText, currentFilters);
    isLoadingMoreRef.current = false;
  };

  const handleSearch = () => {
    Keyboard.dismiss();
    setPage(1); 
    fetchData(1, searchText, currentFilters);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const clearSearch = () => {
    setSearchText('');
    setPage(1);
    fetchData(1, '', currentFilters);
  };

  const applyFilters = (filters: any) => {
    setCurrentFilters(filters);
    setPage(1); 
    fetchData(1, searchText, filters);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollTop(offsetY > 300);
  };

  const renderFooter = () => {
    if (loading && page > 1) {
      return (
        <View className="py-6 items-center justify-center">
          <ActivityIndicator size="small" color="#2563EB" />
          <Text className="text-gray-500 text-xs mt-2">Đang tải thêm...</Text>
        </View>
      );
    }
    
    if (!loading && items.length > 0 && page >= totalPages) {
      return (
        <View className="py-6 items-center justify-center">
          <Text className="text-gray-400 text-xs">Đã hiển thị tất cả sản phẩm</Text>
        </View>
      );
    }
    
    return <View className="h-6" />; 
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="px-4 py-3 border-b border-gray-100 bg-white z-10">
        <Text className="text-xl font-bold text-gray-900">Danh mục sản phẩm</Text>
      </View>

      {/* Search & Filter Bar */}
      <View className="px-4 py-3 flex-row gap-3 items-center bg-white shadow-sm mb-1 z-10">
        {/* Search Input */}
        <View className="flex-1 flex-row bg-gray-50 border border-gray-200 rounded-xl px-4 items-center h-12">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput 
                placeholder="Tìm thuốc, dược phẩm..." 
                className="flex-1 ml-3 text-base text-gray-700 h-full"
                placeholderTextColor="#9CA3AF"
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <Ionicons name="close-circle" size={18} color="#D1D5DB" />
              </TouchableOpacity>
            )}
        </View>
        
        {/* Filter Button */}
        <TouchableOpacity 
            onPress={() => setIsFilterVisible(true)}
            className={`w-12 h-12 rounded-xl items-center justify-center border ${Object.keys(currentFilters).length > 0 ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'}`}
        >
            <Ionicons name="options-outline" size={24} color={Object.keys(currentFilters).length > 0 ? 'white' : '#4B5563'} />
        </TouchableOpacity>
      </View>

      {/* Danh sách Sản phẩm */}
      <FlatList
        ref={flatListRef}
        data={items}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ProductCard product={item} />}
        
        // Style
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20, paddingTop: 10 }}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
        showsVerticalScrollIndicator={false}
        
        // Pagination Logic
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5} // Kích hoạt khi còn 50% màn hình phía dưới
        
        // Refresh Control
        refreshControl={
            <RefreshControl 
                refreshing={isRefreshing} 
                onRefresh={handleRefresh} 
                colors={['#2563EB']} 
                tintColor="#2563EB"
            />
        }
        
        // Components phụ trợ
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
            !loading && items.length === 0 ? (
                <View className="items-center justify-center mt-20">
                    <Ionicons name="cube-outline" size={64} color="#E5E7EB" />
                    <Text className="text-center text-gray-500 mt-4">Không tìm thấy sản phẩm nào</Text>
                </View>
            ) : null
        }

        // Tối ưu hiệu năng
        onScroll={handleScroll}
        removeClippedSubviews={true} // Giúp mượt hơn trên Android
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />

      {/* Back to Top Button */}
      {showScrollTop && (
        <TouchableOpacity 
            onPress={() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true })}
            className="absolute bottom-6 right-6 w-12 h-12 bg-white rounded-full items-center justify-center shadow-lg border border-gray-100 z-50"
        >
            <Ionicons name="arrow-up" size={24} color="#2563EB" />
        </TouchableOpacity>
      )}

      {/* Filter Modal */}
      <FilterModal 
        visible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        onApply={applyFilters}
        initialFilters={currentFilters}
      />
    </SafeAreaView>
  );
}