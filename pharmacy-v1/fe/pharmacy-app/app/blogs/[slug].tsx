import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, useWindowDimensions, Platform, TouchableOpacity, Share } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import RenderHtml from 'react-native-render-html';
import blogService from '../../src/api/blogService';
import { Blog } from '../../src/types/blog';

export default function BlogDetailScreen() {
  const { slug } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper for Android Localhost images
  const getImageUrl = (url?: string) => {
    if (!url) return null;
    if (Platform.OS === 'android' && url.includes('localhost')) {
      return url.replace('localhost', '10.0.2.2');
    }
    return url;
  };

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        if (slug) {
            const res = await blogService.getBlogBySlug(slug as string);
            if (res.data?.data) {
                setBlog(res.data.data);
            }
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  const handleShare = async () => {
    try {
        // Typically you'd share a deep link or web link
        await Share.share({
            message: `Xem bài viết này: ${blog?.title}`,
        });
    } catch (error) {
        console.log(error);
    }
  };

  if (loading) {
    return (
        <SafeAreaView className="flex-1 bg-white justify-center items-center">
            <ActivityIndicator size="large" color="#2563EB" />
        </SafeAreaView>
    );
  }

  if (!blog) {
     return (
        <SafeAreaView className="flex-1 bg-white justify-center items-center">
            <Text>Không tìm thấy bài viết</Text>
        </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View className="flex-row gap-4">
             <TouchableOpacity onPress={handleShare} className="p-1">
                <Ionicons name="share-social-outline" size={24} color="#1F2937" />
             </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
         {/* Thumbnail */}
         <Image 
            source={{ uri: getImageUrl(blog.thumbnail) || 'https://via.placeholder.com/400' }} 
            className="w-full h-56"
            resizeMode="cover"
        />

        <View className="px-4 py-5">
            {/* Category badge */}
            {blog.category && (
                <View className="self-start bg-blue-50 px-3 py-1 rounded-full mb-3">
                    <Text className="text-blue-600 font-bold text-xs uppercase">{blog.category.name}</Text>
                </View>
            )}

            <Text className="text-2xl font-bold text-gray-900 leading-8 mb-3">
                {blog.title}
            </Text>

            <View className="flex-row items-center mb-6">
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                <Text className="text-gray-500 ml-2 text-sm">
                    {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                </Text>
            </View>

            {/* Content Render */}
            <RenderHtml
                contentWidth={width - 32}
                source={{ html: blog.content }}
                tagsStyles={{
                    p: { fontSize: 16, lineHeight: 28, color: '#374151', marginBottom: 12 },
                    h1: { fontSize: 24, fontWeight: 'bold', marginVertical: 12 },
                    h2: { fontSize: 22, fontWeight: 'bold', marginVertical: 10 },
                    h3: { fontSize: 18, fontWeight: 'bold', marginVertical: 8 },
                    img: { borderRadius: 8, marginVertical: 8 }
                }}
            />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
