import React from 'react';
import { View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RateResponse } from '../types';

export const ReviewItem = ({ review }: { review: RateResponse }) => {
  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Ionicons
        key={index}
        name={index < rating ? "star" : "star-outline"}
        size={14}
        color="#F59E0B" 
      />
    ));
  };

  return (
    <View className="flex-row py-4 border-b border-gray-100">
      {/* 1. Avatar */}
      <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center overflow-hidden mr-3">
        {review.userResponse.profilePicUrl ? (
          <Image 
            source={{ uri: review.userResponse.profilePicUrl }} 
            className="w-full h-full"
          />
        ) : (
          <Text className="text-blue-600 font-bold text-lg">
            {review.userResponse.username.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>

      {/* 2. Nội dung */}
      <View className="flex-1">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="font-bold text-gray-900 text-sm">
            {review.userResponse.username}
          </Text>
          {/* Ngày tháng nếu có (Optional) */}
          {/* <Text className="text-xs text-gray-400">2 ngày trước</Text> */}
        </View>

        {/* Stars */}
        <View className="flex-row mb-2">
            {renderStars(review.rating)}
        </View>

        {/* Comment */}
        <Text className="text-gray-600 text-sm leading-5">
            {review.comment}
        </Text>
      </View>
    </View>
  );
};