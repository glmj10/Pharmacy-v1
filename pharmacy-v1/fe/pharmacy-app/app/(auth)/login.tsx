import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Import các components
import { FormField } from '../../src/components/FormField';
import { CustomButton } from '../../src/components/CustomButton';
import { LoginSchema, LoginFormData } from '../../src/types/schemas'; // Đảm bảo import đúng
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { loginUser } from '../../src/store/authSlice';

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Chỉ lấy loading, KHÔNG lấy error tự động hiện alert ở đây nữa để dễ kiểm soát
  const { loading } = useAppSelector((state) => state.auth);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  // --- ❌ XÓA HOẶC COMMENT ĐOẠN CODE CŨ NÀY ĐI ---
  /*
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);
  */
  // ------------------------------------------------

  // --- ✅ SỬ DỤNG CÁCH MỚI NÀY ---
  const onSubmit = async (data: LoginFormData) => {
    try {
      // 1. Gọi action login và đợi kết quả (unwrap giúp tách thành công/thất bại)
      await dispatch(loginUser(data)).unwrap();

      Alert.alert(
        "Đăng nhập thành công",
        "Chào mừng bạn quay trở lại! 👋",
        [
          {
            text: "OK",
            onPress: () => {
              // 3. Chỉ chuyển trang khi người dùng bấm OK (hoặc để tự động cũng được, nhưng để đây cho chắc chắn)
              router.replace('/(tabs)');
            }
          }
        ]
      );
      router.replace('/(tabs)');

    } catch (error: any) {
      // 3. Xử lý lỗi tại đây
      Alert.alert("Đăng nhập thất bại", error || "Vui lòng kiểm tra lại thông tin");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="px-6">

          {/* Logo & Header */}
          <View className="items-center mb-10">
            <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-4">
              <Text className="text-4xl">💊</Text>
            </View>
            <Text className="text-3xl font-bold text-gray-900">Pharmacy App</Text>
            <Text className="text-gray-500 mt-2 text-center">Đăng nhập hệ thống</Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            <FormField
              control={control}
              name="email"
              label="Email"
              placeholder="user@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email?.message}
            />

            <FormField
              control={control}
              name="password"
              label="Mật khẩu"
              placeholder="••••••••"
              secureTextEntry
              error={errors.password?.message}
            />

            <CustomButton
              title="Đăng Nhập"
              onPress={handleSubmit(onSubmit)}
              isLoading={loading}
            />

            <View className="flex-row justify-center mt-8">
              <Text className="text-gray-600">Chưa có tài khoản? </Text>
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity>
                  <Text className="text-blue-600 font-bold">Đăng ký ngay</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}