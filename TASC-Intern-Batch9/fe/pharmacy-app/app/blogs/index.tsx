import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import blogService from '../../src/api/blogService';
import { Blog } from '../../src/types/blog';
import { BlogCard } from '../../src/components/blog/BlogCard';

export default function BlogListScreen() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  function mapBlogResponse(res: any): Blog {
    return {
      id: res.id,
      title: res.title,
      slug: res.slug,
      thumbnail: res.thumbnail,
      category: res.category,
      createdAt: res.createdAt,
      updatedAt: res.updatedAt,
      content: res.content
    };
  }
  const fetchBlogs = async (pageIndex: number, isRefresh = false) => {
    try {
      const res = await blogService.getAllBlogs(pageIndex, 10, searchQuery);
      if (res.data?.data?.content) {
        const newBlogs = res.data.data.content;
        if (isRefresh) {
          setBlogs(newBlogs.map(mapBlogResponse));
        } else {
          setBlogs(prev => [...prev, ...newBlogs.map(mapBlogResponse)]);
        }
        setHasMore(!res.data.data.hasNext ? false : true); // Logic checks if backend hasNext is true, simplistic here
        // Note: Backend might define hasNext differently, assuming typical page response structure
        if (newBlogs.length < 10) setHasMore(false);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs(1, true);
  }, [searchQuery]);

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
      fetchBlogs(page + 1);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900 flex-1">Góc sức khỏe</Text>
      </View>

      {/* Search */}
      <View className="bg-white px-4 py-3 mb-2">
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 h-10">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-gray-900"
            placeholder="Tìm kiếm bài viết..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* List */}
      {loading && blogs.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#2563EB" size="large" />
        </View>
      ) : (
        <FlatList
          data={blogs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View className="px-4">
              <BlogCard blog={item} layout="horizontal" />
            </View>
          )}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 20 }}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-20">
              <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
              <Text className="text-gray-400 mt-2">Chưa có bài viết nào.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
