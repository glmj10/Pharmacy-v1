import React, { useEffect, useState } from 'react';
import { View, Text, Switch, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { updateAddress } from '../../src/store/addressSlice';
import { FormField } from '../../src/components/FormField';
import { CustomButton } from '../../src/components/CustomButton';

// Validate Schema
const AddressSchema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ tên"),
  phoneNumber: z.string().min(10, "Số điện thoại không hợp lệ"),
  address: z.string().min(5, "Địa chỉ quá ngắn"),
});

type AddressFormData = z.infer<typeof AddressSchema>;

export default function EditAddressScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { id } = useLocalSearchParams(); // Lấy ID từ URL
  
  // Lấy danh sách từ Redux để tìm địa chỉ cần sửa
  const { items } = useAppSelector((state) => state.address);
  const targetAddress = items.find(item => item.id.toString() === id);

  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, setValue } = useForm<AddressFormData>({
    resolver: zodResolver(AddressSchema),
  });

  // --- PRE-FILL DATA (Điền dữ liệu cũ) ---
  useEffect(() => {
    if (targetAddress) {
      setValue('fullName', targetAddress.fullName);
      setValue('phoneNumber', targetAddress.phoneNumber);
      setValue('address', targetAddress.address);
      setIsDefault(targetAddress.isDefault);
    } else {
      Alert.alert("Lỗi", "Không tìm thấy địa chỉ");
      router.back();
    }
  }, [targetAddress]);

  // --- XỬ LÝ SUBMIT ---
  const onSubmit = async (data: AddressFormData) => {
    if (!targetAddress) return;
    
    setLoading(true);
    try {
      await dispatch(updateAddress({ 
        id: targetAddress.id, 
        data: { ...data, isDefault } 
      })).unwrap();
      
      Alert.alert("Thành công", "Cập nhật địa chỉ thành công");
      router.back();
    } catch (error: any) {
      Alert.alert("Lỗi", error || "Không thể cập nhật địa chỉ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <Stack.Screen 
        options={{ 
            title: "Chỉnh sửa địa chỉ",
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
            contentContainerStyle={{ padding: 20 }}
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

            <CustomButton title="Lưu thay đổi" onPress={handleSubmit(onSubmit)} isLoading={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}