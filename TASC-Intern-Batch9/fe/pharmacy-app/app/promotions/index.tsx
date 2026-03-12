import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import promotionService from '../../src/api/promotionService';
import PromotionCard from '../../src/components/promotion/PromotionCard';
import { Promotion } from '../../src/types/promotion';

const PromotionScreen = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const res = await promotionService.getCurrentPromotions();
      // Ensure we get the array correctly
      const list = Array.isArray(res.data) ? res.data : (res.data as any).data || [];
      setPromotions(list);
    } catch (error) {
      console.error("Fetch promo error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'bottom']}>
      <Stack.Screen options={{
        title: "Chương trình khuyến mãi",
        headerStyle: { backgroundColor: '#fff' },
        headerShadowVisible: false
      }} />

      {loading ? (
        <View className="flex-1 justify-center items-center">
             <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={promotions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <PromotionCard promotion={item} />}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
             <View className="items-center mt-10">
                <Text className="text-gray-500">Không có chương trình nào</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default PromotionScreen;
