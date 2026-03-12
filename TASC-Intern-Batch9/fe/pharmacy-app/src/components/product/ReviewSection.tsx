import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import rateService from '../../api/rateService';
import { RateResponse } from '../../types/rate';
import { ReviewFormModal } from './ReviewFormModal';

const ReviewSection = ({ productId }: { productId: number }) => {
  const [reviews, setReviews] = useState<RateResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);

  function mapRateResponse(res: any): RateResponse {
    return {
        id: res.id,
        rating: res.rating,
        comment: res.comment,
        createdAt: res.createdAt,
        userResponse: res.userResponse
    };
  }

  const fetchReviews = async () => {
    try {
      const res = await rateService.getRatesByProduct(productId, 1, 5);
      if (res.data && res.data.data && Array.isArray(res.data.data.content)) {
        setReviews(res.data.data.content.map(mapRateResponse));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  if (loading) return null;

  return (
    <View className="bg-white mt-3 px-4 py-5">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-gray-900">Đánh giá sản phẩm ({reviews.length})</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text className="text-blue-600 font-bold">Viết đánh giá</Text>
        </TouchableOpacity>
      </View>
      
      {reviews.length === 0 ? (
         <View className="py-6 items-center">
            <Text className="text-gray-400">Chưa có đánh giá nào.</Text>
         </View>
      ) : (
        reviews.map((review) => (
            <View key={review.id} className="mb-4 border-b border-gray-100 pb-3 last:border-0">
            <View className="flex-row items-center mb-2">
                <Image 
                    source={{ uri: review.userResponse?.profilePicUrl || 'https://via.placeholder.com/40' }} 
                    className="w-8 h-8 rounded-full bg-gray-200"
                />
                <View className="ml-3">
                    <Text className="font-bold text-gray-800 text-sm">{review.userResponse?.username || "Người dùng ẩn danh"}</Text>
                    <View className="flex-row mt-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Ionicons 
                                key={star} 
                                name={star <= review.rating ? "star" : "star-outline"} 
                                size={12} 
                                color="#FBBF24" 
                            />
                        ))}
                    </View>
                </View>
                <Text className="ml-auto text-xs text-gray-400">
                    {new Date(review.createdAt || Date.now()).toLocaleString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                    })}
                </Text>
            </View>
            <Text className="text-gray-600 ml-11 leading-5">{review.comment}</Text>
            </View>
        ))
      )}

      <ReviewFormModal 
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        orderDetailId={productId}
        onSubmitSuccess={fetchReviews}
      />
    </View>
  );
};


export default ReviewSection;
