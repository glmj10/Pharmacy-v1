import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { logoutUser, fetchUserProfile } from '../../src/store/authSlice';
import { useRouter } from 'expo-router';
import { AppHeader } from '../../src/components/layout/AppHeader';

const MenuItem = ({ icon, title, onPress, isDestructive = false }: any) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center bg-white p-4 mb-1 border-b border-gray-50"
  >
    <View className={`w-9 h-9 rounded-full items-center justify-center mr-4 ${isDestructive ? 'bg-red-50' : 'bg-blue-50'}`}>
      <Ionicons name={icon} size={20} color={isDestructive ? '#EF4444' : '#2563EB'} />
    </View>
    <Text className={`flex-1 text-base font-medium ${isDestructive ? 'text-red-500' : 'text-gray-700'}`}>
      {title}
    </Text>
    <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserProfile());
    }

    console.log(user?.profilePic)
  }, [isAuthenticated, dispatch]);

  const handleLogout = () => {
    Alert.alert(
      "Đăng xuất", // Tiêu đề
      "Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?", // Nội dung
      [
        {
          text: "Hủy",
          style: "cancel", // Nút hủy (iOS sẽ in đậm)
          onPress: () => console.log("Hủy đăng xuất"),
        },
        {
          text: "Đăng xuất",
          style: "destructive", // Nút đỏ (Cảnh báo)
          onPress: async () => {
            await dispatch(logoutUser());
          },
        },
      ]
    );
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  // --- GIAO DIỆN KHÁCH (CHƯA LOGIN) ---
  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-6">
            <Ionicons name="person" size={40} color="#2563EB" />
          </View>
          <Text className="text-xl font-bold text-gray-900 mb-2">Bạn chưa đăng nhập</Text>
          <Text className="text-gray-500 text-center mb-8">
            Đăng nhập để quản lý đơn hàng, lưu địa chỉ và nhận ưu đãi từ nhà thuốc.
          </Text>

          <TouchableOpacity
            onPress={handleLogin}
            className="w-full bg-blue-600 py-3.5 rounded-xl items-center shadow-sm mb-4"
          >
            <Text className="text-white font-bold text-lg">Đăng Nhập</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/register')}
            className="w-full bg-white border border-blue-600 py-3.5 rounded-xl items-center"
          >
            <Text className="text-blue-600 font-bold text-lg">Đăng Ký Tài Khoản</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --- GIAO DIỆN ĐÃ LOGIN ---
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <AppHeader title="Cá nhân" showSearch={false} showBack={false} />
      
      {/* Header Profile */}
      <View className="bg-white p-6 items-center mb-4 border-b border-gray-100 shadow-sm mt-1">
        <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-3 border-4 border-blue-50">
          {user?.profilePic ? (
            <Image source={{ uri: user.profilePic }} className="w-full h-full rounded-full" />
          ) : (
            <Text className="text-4xl">👤</Text>
          )}
        </View>
        <Text className="text-xl font-bold text-gray-900">{user?.username}</Text>
        <Text className="text-gray-500">{user?.email}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        <View className="px-4 mb-2">
          <Text className="text-gray-500 font-medium mb-2 ml-1 text-xs uppercase">Tài khoản</Text>
        </View>

        <View className="bg-white rounded-xl mx-4 overflow-hidden mb-6 shadow-sm border border-gray-100">
          <MenuItem
            icon="receipt-outline"
            title="Đơn mua"
            onPress={() => router.push('/orders')} // Link tới file vừa tạo
          />
          <MenuItem 
            icon="ticket-outline" 
            title="Ví Voucher" 
            onPress={() => router.push('/profile/vouchers')} 
          />
          <MenuItem icon="heart-outline" title="Sản phẩm yêu thích" onPress={() => router.push('/wishlist')} />
          {/* <MenuItem icon="star-outline" title="Đánh giá của tôi" onPress={() => { }} /> */}
        </View>

        <View className="bg-white rounded-xl mx-4 overflow-hidden mb-6 shadow-sm">
          <MenuItem
            icon="person-outline"
            title="Thông tin cá nhân"
            onPress={() => router.push('/profile/edit')}
          />

          <MenuItem
            icon="location-outline"
            title="Sổ địa chỉ"
            onPress={() => router.push('/address')}
          />
          <MenuItem
            icon="lock-closed-outline"
            title="Đổi mật khẩu"
            onPress={() => router.push('/profile/change-password')}
          />
        </View>

        <View className="px-4 mb-2">
          <Text className="text-gray-500 font-medium mb-2 ml-1 text-xs uppercase">Hệ thống</Text>
        </View>

        <View className="bg-white rounded-xl mx-4 overflow-hidden mb-8 shadow-sm">
          <MenuItem icon="help-circle-outline" title="Trung tâm trợ giúp" onPress={() => { }} />
          <MenuItem icon="log-out-outline" title="Đăng xuất" isDestructive onPress={handleLogout} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}