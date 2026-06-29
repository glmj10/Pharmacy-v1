import React, { useState } from 'react';
import { View, ActivityIndicator, Alert, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import paymentService from '../../src/api/paymentService';

export default function PaymentWebView() {
  const { url } = useLocalSearchParams();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);

  const handleNavigationStateChange = async (navState: any) => {
    const { url } = navState;

    if (!url || processing) return;

    if (url.includes('vnp_ResponseCode')) {
      setProcessing(true);
      
      try {
        const queryString: string = url.split('?')[1];


        const res = await paymentService.handleVnPayReturn(queryString);
        
        Alert.alert(
            "Thanh toán thành công", 
            res.data?.message || "Giao dịch đã được ghi nhận",
            [
                { 
                    text: "Hoàn tất", 
                    onPress: () => router.replace('/checkout/success') 
                }
            ]
        );

      } catch (error: any) {
         console.error("VNPAY Verify Error", error);
         const errorMsg = error.response?.data?.message || "Thanh toán thất bại hoặc có lỗi xác thực";
         
         Alert.alert(
            "Thanh toán thất bại",
            errorMsg,
            [
                { text: "Quay lại", onPress: () => router.back() } 
            ]
         );
      }
    }
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ title: "Thanh toán VNPAY", headerBackTitle: "Hủy" }} />
      
      {processing ? (
          <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#2563EB" />
              <Text className="mt-4 text-gray-600 font-medium">Đang xác thực giao dịch...</Text>
              <Text className="text-gray-400 text-xs mt-1">Vui lòng không tắt ứng dụng</Text>
          </View>
      ) : (
          <WebView
            source={{ uri: url as string }}
            onNavigationStateChange={handleNavigationStateChange}
            startInLoadingState
            renderLoading={() => <ActivityIndicator size="large" color="#2563EB" style={{ position: 'absolute', top: '50%', left: '46%' }} />}
          />
      )}
    </View>
  );
}