import React, { useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { fetchCategories } from '../../src/store/productSlice';
import { Category } from '../../src/types';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2; // 2 cột, padding 16*2, gap 16

export default function CategoryScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { categories, loading } = useAppSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchCategories());
  }, []);

  const handlePressCategory = (cat: Category) => {
    router.push({
        pathname: '/products',
        params: { categorySlug: cat.slug, title: cat.name } 
    });
  };
  const getImageUrl = (url?: string) => {
    if (!url) return null;
    if (Platform.OS === 'android' && url.includes('localhost')) {
      return url.replace('localhost', '10.0.2.2');
    }
    return url;
  };

  const renderItem = ({ item }: { item: Category }) => (
    <TouchableOpacity 
        onPress={() => handlePressCategory(item)}
        className="bg-white rounded-2xl mb-4 shadow-sm border border-gray-100 overflow-hidden"
        style={{ width: ITEM_WIDTH }}
        activeOpacity={0.7}
    >
        <View className="h-32 w-full bg-gray-50 items-center justify-center p-2">
            {item.thumbnail ? (
                <Image 
                    source={{ uri: getImageUrl(item.thumbnail) || undefined }} 
                    className="w-full h-full" 
                    resizeMode="contain" 
                />
            ) : (
                <Ionicons name="file-tray-full-outline" size={40} color="#D1D5DB" />
            )}
        </View>
        <View className="p-3 items-center">
            <Text className="font-bold text-gray-800 text-center" numberOfLines={2}>
                {item.name}
            </Text>
            {item.children && item.children.length > 0 && (
                <Text className="text-xs text-gray-400 mt-1">{item.children.length} mục con</Text>
            )}
        </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="px-5 py-4 border-b border-gray-100 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-gray-900">Danh mục</Text>
        <TouchableOpacity onPress={() => router.push('/products')}>
            <Ionicons name="search" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={{ padding: 16 }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
            <Text className="text-center text-gray-500 mt-20">Đang tải danh mục...</Text>
        }
      />
    </SafeAreaView>
  );
}