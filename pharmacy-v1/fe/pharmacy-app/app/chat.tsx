import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../src/store/hooks';
import { addUserMessage, sendMessageToAgent } from '../src/store/chatSlice';

// 1. Tạo Component hiển thị hiệu ứng "Đang nhập..."
const TypingIndicator = () => {
  return (
    <View className="flex-row mb-4 justify-start">
      {/* Avatar Bot */}
      <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-2 border border-blue-200">
        <Ionicons name="medical" size={16} color="#2563EB" />
      </View>
      
      {/* Bong bóng Loading */}
      <View className="px-4 py-3 bg-gray-100 rounded-2xl rounded-bl-none flex-row items-center shadow-sm">
         <Text className="text-gray-400 text-xs italic mr-2">Đang trả lời...</Text>
         <ActivityIndicator size="small" color="#6B7280" />
      </View>
    </View>
  );
};

export default function ChatScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  
  const { messages, loading } = useAppSelector((state) => state.chat);
  const [inputText, setInputText] = useState('');

  // 2. Sửa lại Auto Scroll: Cuộn xuống khi có tin nhắn mới HOẶC khi đang loading
  useEffect(() => {
    setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, loading]); // <--- Thêm 'loading' vào dependency

  const handleSend = () => {
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText(''); 
    dispatch(addUserMessage(text));
    dispatch(sendMessageToAgent(text));
  };

  const renderItem = ({ item }: { item: any }) => {
    const isUser = item.sender === 'user';
    return (
      <View className={`flex-row mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && (
          <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-2 border border-blue-200">
            <Ionicons name="medical" size={16} color="#2563EB" />
          </View>
        )}
        <View 
            className={`px-4 py-3 rounded-2xl max-w-[75%] shadow-sm ${
                isUser 
                ? 'bg-blue-600 rounded-br-none' 
                : 'bg-white border border-gray-100 rounded-bl-none'
            }`}
        >
            <Text className={`text-base leading-6 ${isUser ? 'text-white' : 'text-gray-800'}`}>
                {item.text}
            </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shadow-sm z-10">
        <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
                <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <View>
                <Text className="text-lg font-bold text-gray-900">Dược sĩ AI 🤖</Text>
                <View className="flex-row items-center">
                    <View className={`w-2 h-2 rounded-full mr-1.5 ${loading ? 'bg-orange-500' : 'bg-green-500'}`} />
                    <Text className="text-xs text-gray-500 font-medium">
                        {loading ? 'Đang soạn tin...' : 'Trực tuyến'}
                    </Text>
                </View>
            </View>
        </View>
        <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Message List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        
        // 3. QUAN TRỌNG: Thêm Footer Component để hiển thị bong bóng loading
        ListFooterComponent={loading ? <TypingIndicator /> : null}
      />

      {/* Input Area */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <View className="p-3 bg-white border-t border-gray-100 flex-row items-center" style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 12 }}>
            <TextInput
                className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 mr-3 text-base max-h-24"
                placeholder="Nhập triệu chứng hoặc tên thuốc..."
                value={inputText}
                onChangeText={setInputText}
                multiline
                placeholderTextColor="#9CA3AF"
            />
            
            <TouchableOpacity 
                onPress={handleSend}
                disabled={loading || !inputText.trim()}
                className={`w-12 h-12 rounded-full items-center justify-center ${
                    !inputText.trim() || loading ? 'bg-gray-200' : 'bg-blue-600'
                }`}
            >
                <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}