import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Image } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import promotionService from '../../src/api/promotionService';
import { Promotion, PromotionItemResponse } from '../../src/types/promotion';

const PromotionDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [items, setItems] = useState<PromotionItemResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
        fetchData(Number(id));
    }
  }, [id]);


//   function mapPromotionResonseToPromotion(res: any): Promotion {
//     return {
//       id: res.id,
//         name: res.name,
//         thumbnailUrl: res.thumbnailUrl,
//         startTime: res.startTime,
//         endTime: res.endTime,
//         status: res.status
//     };
//   }

  function mapPromotionItemResponse(res: any): PromotionItemResponse {
    return {
        id: res.id,
        salePrice: res.salePrice,
        product: res.product
    };
  }
  const fetchData = async (promoId: number) => {
    try {
      const [promoDetail, itemsRes] = await Promise.all([
        promotionService.getPromotionDetail(promoId),
        promotionService.getPromotionItems(promoId, 0, 20)
      ]);
      
      setPromotion(promoDetail!);
      if (itemsRes.data && itemsRes.data.data && Array.isArray(itemsRes.data.data.content)) {
          setItems(itemsRes.data.data.content.map(mapPromotionItemResponse));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen options={{ title: promotion?.name || 'Chi tiết' }} />
      
      {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
      ) : (
          <FlatList
            ListHeaderComponent={
                promotion ? (
                    <View className="mb-4">
                        <Image source={{ uri: promotion.thumbnailUrl }} className="w-full h-48 bg-gray-300" resizeMode="cover" />
                        <View className="p-4 bg-white">
                            <Text className="text-xl font-bold text-gray-800">{promotion.name}</Text>
                            <Text className="text-gray-500 mt-2">
                                {new Date(promotion.startTime).toLocaleDateString()} - {new Date(promotion.endTime).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                ) : null
            }
            data={items}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
                const originalPrice = item.product.priceOld > item.salePrice
                    ? item.product.priceOld
                    : item.product.priceNew > item.salePrice
                    ? item.product.priceNew
                    : null;
                const discountPct = originalPrice
                    ? Math.round((1 - item.salePrice / originalPrice) * 100)
                    : 0;

                return (
                    <View className="flex-row bg-white p-3 mx-4 mb-3 rounded-lg shadow-sm">
                        <View className="relative">
                            <Image source={{ uri: item.product.thumbnail }} className="w-20 h-20 rounded bg-gray-100" />
                            {discountPct > 0 && (
                                <View className="absolute top-1 left-1 bg-red-500 px-1 py-0.5 rounded">
                                    <Text className="text-white text-[10px] font-bold">-{discountPct}%</Text>
                                </View>
                            )}
                        </View>
                        <View className="ml-3 flex-1 justify-center">
                            <Text className="font-medium text-gray-800" numberOfLines={2}>{item.product.title}</Text>
                            <Text className="text-red-600 font-bold mt-1">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.salePrice)}
                            </Text>
                            {originalPrice && (
                                <Text className="text-gray-400 text-xs line-through">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(originalPrice)}
                                </Text>
                            )}
                        </View>
                    </View>
                );
            }}
          />
      )}
    </View>
  );
};

export default PromotionDetailScreen;
