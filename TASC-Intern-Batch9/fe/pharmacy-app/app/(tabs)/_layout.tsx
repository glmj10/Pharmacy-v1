import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Component Nút Chat Nổi (Giữ nguyên)
const CustomChatButton = ({ children, onPress }: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      top: -20,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#2563EB',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    }}
  >
    <View className="w-16 h-16 rounded-full bg-blue-600 items-center justify-center border-4 border-gray-50">
      {children}
    </View>
  </TouchableOpacity>
);

export default function TabsLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          elevation: 0,
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '500', marginTop: -2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={24} color={color} />,
        }}
      />
      
      {/* --- KHÔI PHỤC TAB SẢN PHẨM --- */}
      <Tabs.Screen
        name="products"
        options={{
          title: 'Sản phẩm',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={24} color={color} />,
        }}
      />
      {/* ----------------------------- */}

      {/* Nút Chat (Giữ nguyên) */}
      <Tabs.Screen
        name="chat_placeholder"
        options={{
          title: '',
          tabBarIcon: () => <Ionicons name="chatbubbles" size={28} color="white" />,
          tabBarButton: (props) => <CustomChatButton {...props} onPress={() => router.push('/chat')} />,
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: 'Giỏ hàng',
          tabBarIcon: ({ color, size }) => <Ionicons name="cart-outline" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Cá nhân',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={24} color={color} />,
        }}
      />

      {/* Ẩn các file không dùng */}
      <Tabs.Screen name="orders" options={{ href: null }} />
      <Tabs.Screen name="categories" options={{ href: null }} /> 
    </Tabs>
  );
}