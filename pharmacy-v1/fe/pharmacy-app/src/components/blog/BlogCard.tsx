import React from 'react';
import { View, Text, Image, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Blog } from '../../types/blog';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

interface BlogCardProps {
  blog: Blog;
  layout?: 'vertical' | 'horizontal';
}

export const BlogCard: React.FC<BlogCardProps> = ({ blog, layout = 'vertical' }) => {
  const router = useRouter();
  const { width } = useWindowDimensions();

  // Helper cho ảnh localhost trên Android
  const getImageUrl = (url?: string) => {
    if (!url) return null;
    if (Platform.OS === 'android' && url.includes('localhost')) {
      return url.replace('localhost', '10.0.2.2');
    }
    return url;
  };

  const formattedDate = new Date(blog.createdAt).toLocaleDateString('vi-VN');

  if (layout === 'horizontal') {
    return (
      <TouchableOpacity 
        className="flex-row bg-white bg-white rounded-xl mb-3 border border-gray-100 overflow-hidden shadow-sm"
        onPress={() => router.push(`/blogs/${blog.slug}`)}
      >
        <Image 
          source={{ uri: getImageUrl(blog.thumbnail) || 'https://via.placeholder.com/150' }} 
          className="w-28 h-28"
          resizeMode="cover"
        />
        <View className="flex-1 p-3 justify-between">
          <View>
            {blog.category && (
                <Text className="text-blue-600 text-xs font-bold mb-1">{blog.category.name}</Text>
            )}
            <Text className="text-gray-900 font-bold text-sm leading-5" numberOfLines={2}>
              {blog.title}
            </Text>
          </View>
          <View className="flex-row items-center mt-2">
            <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
            <Text className="text-gray-400 text-xs ml-1">{formattedDate}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Vertical (Card) layout - for Home screen list
  return (
    <TouchableOpacity 
      className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm mr-4 w-60"
      onPress={() => router.push(`/blogs/${blog.slug}`)}
    >
      <Image 
        source={{ uri: getImageUrl(blog.thumbnail) || 'https://via.placeholder.com/300' }} 
        className="w-full h-32"
        resizeMode="cover"
      />
      <View className="p-3">
         {blog.category && (
            <Text className="text-blue-600 text-xs font-bold mb-1">{blog.category.name}</Text>
         )}
        <Text className="text-gray-900 font-bold text-sm leading-5 mb-2" numberOfLines={2}>
          {blog.title}
        </Text>
        <View className="flex-row items-center border-t border-gray-100 pt-2">
           <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
           <Text className="text-gray-400 text-xs ml-1">{formattedDate}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
