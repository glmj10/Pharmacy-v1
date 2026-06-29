import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormField } from '../../src/components/FormField';
import { CustomButton } from '../../src/components/CustomButton';
import { ChangePasswordSchema, ChangePasswordFormData } from '../../src/types/schemas';
import { useAppDispatch } from '../../src/store/hooks';
import { changePassword } from '../../src/store/authSlice';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setLoading(true);
    try {
      await dispatch(changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword
      })).unwrap();

      Alert.alert("Thành công", "Đổi mật khẩu thành công!", [
        { 
          text: "OK", 
          onPress: () => {
            reset();
            router.back();
          }
        }
      ]);
      
    } catch (error: any) {
      Alert.alert("Lỗi", error || "Không thể đổi mật khẩu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <Stack.Screen 
        options={{ 
          title: "Đổi mật khẩu", 
          headerShown: true,
          headerBackTitle: "Hủy",
          headerShadowVisible: false,
        }} 
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          
          <FormField
            control={control}
            name="currentPassword"
            label="Mật khẩu hiện tại"
            placeholder="Nhập mật khẩu cũ"
            secureTextEntry
            error={errors.currentPassword?.message}
          />

          <FormField
            control={control}
            name="newPassword"
            label="Mật khẩu mới"
            placeholder="Nhập mật khẩu mới (min 6 ký tự)"
            secureTextEntry
            error={errors.newPassword?.message}
          />

          <FormField
            control={control}
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            placeholder="Nhập lại mật khẩu mới"
            secureTextEntry
            error={errors.confirmPassword?.message}
          />

          <View className="mt-6">
            <CustomButton 
              title="Cập nhật mật khẩu" 
              onPress={handleSubmit(onSubmit)} 
              isLoading={loading}
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}