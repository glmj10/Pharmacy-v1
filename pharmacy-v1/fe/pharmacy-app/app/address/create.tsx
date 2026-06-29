import React, { useState } from 'react';
import { View, Text, Switch, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context'; // Import

import { useAppDispatch } from '../../src/store/hooks';
import { addAddress } from '../../src/store/addressSlice';
import { FormField } from '../../src/components/FormField';
import { CustomButton } from '../../src/components/CustomButton';

const AddressSchema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ tên"),
  phoneNumber: z.string().min(10, "Số điện thoại không hợp lệ"),
  address: z.string().min(5, "Địa chỉ quá ngắn"),
});

type AddressFormData = z.infer<typeof AddressSchema>;

export default function CreateAddressScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit } = useForm<AddressFormData>({
    resolver: zodResolver(AddressSchema),
  });

  const onSubmit = async (data: AddressFormData) => {
    setLoading(true);
    try {
      await dispatch(addAddress({ ...data, isDefault })).unwrap();
      Alert.alert("Thành công", "Đã thêm địa chỉ mới");
      router.back();
    } catch (error: any) {
      Alert.alert("Lỗi", error || "Không thể thêm địa chỉ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <Stack.Screen 
        options={{ 
            title: "Thêm địa chỉ mới",
            headerStyle: { backgroundColor: 'white' },
            headerShadowVisible: false
        }} 
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView 
            className="flex-1"
            contentContainerStyle={{ padding: 20 }} // Padding đều 4 phía
            showsVerticalScrollIndicator={false}
        >
            <FormField control={control} name="fullName" label="Họ và tên" placeholder="Nguyễn Văn A" />
            <FormField control={control} name="phoneNumber" label="Số điện thoại" placeholder="09xxxxxxx" keyboardType="phone-pad" />
            <FormField 
                control={control} 
                name="address" 
                label="Địa chỉ chi tiết" 
                placeholder="Số nhà, đường, phường, quận..." 
                multiline 
                numberOfLines={3} 
                style={{ height: 80, textAlignVertical: 'top' }} 
            />

            <View className="flex-row justify-between items-center mt-4 mb-8">
                <Text className="text-base text-gray-700 font-medium">Đặt làm địa chỉ mặc định</Text>
                <Switch 
                    value={isDefault} 
                    onValueChange={setIsDefault} 
                    trackColor={{ false: "#767577", true: "#2563EB" }}
                />
            </View>

            <CustomButton title="Lưu địa chỉ" onPress={handleSubmit(onSubmit)} isLoading={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}