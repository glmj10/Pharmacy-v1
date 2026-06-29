import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert, Platform, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { FormField } from '../../src/components/FormField';
import { CustomButton } from '../../src/components/CustomButton';
import { EditProfileSchema, EditProfileFormData } from '../../src/types/schemas';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { updateUserInfo } from '../../src/store/authSlice';

export default function EditProfileScreen() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);

    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<EditProfileFormData>({
        resolver: zodResolver(EditProfileSchema),
        defaultValues: {
            username: user?.username || '',
        }
    });

    // Theo dõi thay đổi
    const currentUsername = watch('username');
    const hasChanges = currentUsername !== user?.username || selectedImage !== null;

    useEffect(() => {
        if (user) {
            setValue('username', user.username);
        }
    }, [user]);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh để thay đổi avatar.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'], 
            allowsEditing: true,
            aspect: [1, 1], 
            quality: 0.7, 
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const onSubmit = async (data: EditProfileFormData) => {
        setLoading(true);
        try {
            const formData = new FormData();

            const infoObj = {
                username: data.username,
                email: user?.email
            };

            // React Native FormData: gửi JSON như một "file" với type application/json
            formData.append('info', {
                string: JSON.stringify(infoObj),
                type: 'application/json'
            } as any);

            // 2. Xử lý phần 'profilePic' (File)
            if (selectedImage) {
                const uri = selectedImage;
                const uriParts = uri.split('.');
                const fileType = uriParts[uriParts.length - 1];

                // Ép kiểu any để TypeScript không báo lỗi với FormData React Native
                formData.append('profilePic', {
                    uri: uri,
                    name: `photo.${fileType}`,
                    type: `image/${fileType}`,
                } as any);
            }

            // 3. Gọi Redux Action
            await dispatch(updateUserInfo(formData)).unwrap();

            Alert.alert("Thành công", "Cập nhật thông tin thành công!", [
                { text: "OK", onPress: () => router.back() }
            ]);

        } catch (error: any) {
            console.error("Upload error:", error);
            Alert.alert("Lỗi", "Không thể cập nhật thông tin. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
            <Stack.Screen
                options={{
                    title: "Chỉnh sửa hồ sơ",
                    headerShown: true,
                    headerBackTitle: "Hủy",
                    headerShadowVisible: false
                }}
            />

            <ScrollView contentContainerStyle={{ padding: 20 }}>

                {/* Avatar Section */}
                <View className="items-center mb-8">
                    <TouchableOpacity onPress={pickImage} className="relative">
                        <View className="w-28 h-28 rounded-full bg-gray-100 border-2 border-white shadow-sm overflow-hidden items-center justify-center">
                            {selectedImage ? (
                                <Image source={{ uri: selectedImage }} className="w-full h-full" />
                            ) : user?.profilePic ? (
                                <Image source={{ uri: user.profilePic }} className="w-full h-full" />
                            ) : (
                                <Ionicons name="person" size={50} color="#9CA3AF" />
                            )}
                        </View>

                        {/* Camera Icon Overlay */}
                        <View className="absolute bottom-0 right-0 bg-blue-600 w-8 h-8 rounded-full items-center justify-center border-2 border-white">
                            <Ionicons name="camera" size={16} color="white" />
                        </View>
                    </TouchableOpacity>
                    <Text className="text-blue-600 font-medium mt-3" onPress={pickImage}>
                        Thay đổi ảnh đại diện
                    </Text>
                </View>

                {/* Form Inputs */}
                <View className="space-y-4">
                    {/* Email (Read only) */}
                    <View className="mb-4">
                        <Text className="text-gray-700 font-medium mb-1.5 ml-1">Email</Text>
                        <View className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3">
                            <Text className="text-gray-500">{user?.email}</Text>
                        </View>
                    </View>

                    {/* Username */}
                    <FormField
                        control={control}
                        name="username"
                        label="Họ và tên hiển thị"
                        placeholder="Nhập tên hiển thị"
                        error={errors.username?.message}
                    />
                </View>

                {/* Submit Button */}
                <View className="mt-8">
                    <CustomButton
                        title="Lưu thay đổi"
                        onPress={handleSubmit(onSubmit)}
                        isLoading={loading}
                        disabled={!hasChanges}
                    />
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}