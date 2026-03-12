import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { fetchAddresses } from '../../src/store/addressSlice';
import { createOrder } from '../../src/store/orderSlice';
import { VoucherSelectionModal } from '../../src/components/checkout/VoucherSelectionModal';
import { Voucher } from '../../src/types/voucher';
import { CustomButton } from '../../src/components/CustomButton';

export default function CheckoutScreen() {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const { items: addresses } = useAppSelector((state) => state.address);
    const { items: cartItems, totalPrice } = useAppSelector((state) => state.cart);
    const { loading } = useAppSelector((state) => state.orders);

    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPAY'>('COD');
    const [note, setNote] = useState('');

    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [productErrors, setProductErrors] = useState<Record<number, string>>({});

    const getProductErrorMessage = (errorCode: string) => {
        switch (errorCode) {
            case 'PRODUCT_OUT_OF_STOCK': return 'Sản phẩm đã hết hàng';
            case 'INSUFFICIENT_STOCK': return 'Số lượng tồn kho không đủ';
            case 'PRODUCT_NOT_FOUND': return 'Sản phẩm không tồn tại';
            case 'PRODUCT_UNAVAILABLE': return 'Sản phẩm tạm ngừng kinh doanh';
            default: return 'Không thể đặt hàng sản phẩm này';
        }
    };

    useEffect(() => {
        dispatch(fetchAddresses());
    }, []);

    useEffect(() => {
        if (selectedVoucher && totalPrice < selectedVoucher.minOrderValue) {
            setSelectedVoucher(null);
            Alert.alert("Voucher bị hủy", "Giá trị đơn hàng không còn đủ điều kiện áp dụng voucher đã chọn.");
        }
    }, [totalPrice]);

    useEffect(() => {
        if (addresses.length > 0 && !selectedAddressId) {
            const defaultAddr = addresses.find(a => a.isDefault);
            setSelectedAddressId(defaultAddr ? defaultAddr.id : addresses[0].id);
        }
    }, [addresses]);

    const currentAddress = addresses.find(a => a.id === selectedAddressId);

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            Alert.alert("Thiếu thông tin", "Vui lòng thêm địa chỉ giao hàng");
            return;
        }

        setProductErrors({});
        try {
            const resultAction = await dispatch(createOrder({
                profileId: selectedAddressId,
                paymentMethod,
                note,
                voucherId: selectedVoucher?.id,
            }));

            if (createOrder.fulfilled.match(resultAction)) {
                const payload = resultAction.payload;
                const paymentUrl = typeof payload === 'string' ? payload : (payload as any)?.paymentUrl;

                if (paymentMethod === 'VNPAY' && paymentUrl) {
                    const safeUrl = encodeURIComponent(paymentUrl);
                    router.push({
                        pathname: '/checkout/payment',
                        params: { url: safeUrl }
                    });
                } else {
                    router.replace('/checkout/success');
                }
            }
        } catch (error: any) {
            const errorData = error?.response?.data;
            if (errorData?.errorCode === 'PRODUCT_RESERVATION_FAILED' && Array.isArray(errorData?.data)) {
                const errMap: Record<number, string> = {};
                errorData.data.forEach((item: any) => {
                    errMap[item.productId] = item.errorCode;
                });
                setProductErrors(errMap);
                Alert.alert(
                    "Đặt hàng thất bại",
                    "Một số sản phẩm trong đơn không thể đặt hàng. Vui lòng kiểm tra bên dưới."
                );
            } else {
                Alert.alert("Đặt hàng thất bại", errorData?.message || 'Đã có lỗi xảy ra, vui lòng thử lại.');
            }
        }
    };

    const calculateDiscount = () => {
        if (!selectedVoucher) return 0;
        let discount = 0;
        if (selectedVoucher.discountType === 'PERCENTAGE') {
            discount = totalPrice * (selectedVoucher.discountValue / 100);
            if (selectedVoucher.maxDiscountAmount && discount > selectedVoucher.maxDiscountAmount) {
                discount = selectedVoucher.maxDiscountAmount;
            }
        } else {
            discount = selectedVoucher.discountValue;
        }
        return Math.floor(discount);
    };

    const discountAmount = calculateDiscount();
    const shippingFee = 0;
    const finalTotal = Math.max(0, totalPrice + shippingFee - discountAmount);

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'bottom']}>
            <Stack.Screen options={{ title: "Thanh toán", headerBackTitle: "Giỏ hàng" }} />

            <VoucherSelectionModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSelect={setSelectedVoucher}
                orderTotal={totalPrice}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* ĐỊA CHỈ */}
                    <View className="bg-white p-4 rounded-xl mb-4 shadow-sm">
                        <View className="flex-row justify-between items-center mb-2">
                            <View className="flex-row items-center">
                                <Ionicons name="location-outline" size={20} color="#2563EB" />
                                <Text className="font-bold text-gray-900 ml-2">Địa chỉ nhận hàng</Text>
                            </View>
                            <TouchableOpacity onPress={() => router.push('/address')}>
                                <Text className="text-blue-600 text-xs font-bold">Thay đổi</Text>
                            </TouchableOpacity>
                        </View>

                        {currentAddress ? (
                            <View>
                                <Text className="font-bold text-gray-800">{currentAddress.fullName} | {currentAddress.phoneNumber}</Text>
                                <Text className="text-gray-500 mt-1">{currentAddress.address}</Text>
                            </View>
                        ) : (
                            <TouchableOpacity onPress={() => router.push('/address/create')} className="py-2">
                                <Text className="text-orange-500 italic">Chưa có địa chỉ. Bấm để thêm ngay!</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* DANH SÁCH SẢN PHẨM */}
                    <View className="bg-white p-4 rounded-xl mb-4 shadow-sm">
                        <Text className="font-bold text-gray-900 mb-3">Sản phẩm ({cartItems.filter(i => i.selected).length})</Text>
                        {cartItems.filter(i => i.selected).map((item) => {
                            const errorCode = productErrors[item.product.id];
                            const hasError = !!errorCode;
                            return (
                                <View
                                    key={item.id}
                                    style={{
                                        marginBottom: 12,
                                        paddingBottom: 8,
                                        borderBottomWidth: 1,
                                        borderBottomColor: hasError ? '#FECACA' : '#F9FAFB',
                                        backgroundColor: hasError ? '#FEF2F2' : 'transparent',
                                        borderRadius: hasError ? 8 : 0,
                                        paddingHorizontal: hasError ? 8 : 0,
                                        paddingTop: hasError ? 8 : 0,
                                    }}
                                >
                                    <View className="flex-row justify-between">
                                        <Text
                                            className="flex-1 mr-2 text-xs"
                                            style={{ color: hasError ? '#B91C1C' : '#4B5563', fontWeight: hasError ? '600' : '400' }}
                                            numberOfLines={2}
                                        >
                                            {item.quantity}x {item.product.title}
                                        </Text>
                                        <Text
                                            className="font-medium text-xs"
                                            style={{
                                                color: hasError ? '#F87171' : '#1F2937',
                                                textDecorationLine: hasError ? 'line-through' : 'none',
                                            }}
                                        >
                                            {(item.product.priceNew * item.quantity).toLocaleString('vi-VN')}đ
                                        </Text>
                                    </View>
                                    {hasError && (
                                        <View className="flex-row items-center mt-1">
                                            <Ionicons name="alert-circle" size={13} color="#DC2626" />
                                            <Text style={{ color: '#DC2626', fontSize: 11, marginLeft: 4, fontWeight: '500' }}>
                                                {getProductErrorMessage(errorCode)}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>

                    {/* VOUCHER */}
                    <TouchableOpacity
                        onPress={() => setModalVisible(true)}
                        className="bg-white p-4 rounded-xl mb-4 shadow-sm flex-row justify-between items-center"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="ticket-outline" size={20} color={selectedVoucher ? "#2563EB" : "#F59E0B"} />
                            <Text className="font-bold text-gray-900 ml-2">Voucher Shop</Text>
                        </View>
                        <View className="flex-row items-center">
                            {selectedVoucher ? (
                                <View className="bg-blue-50 px-2 py-1 rounded border border-blue-200 mr-1">
                                    <Text className="text-blue-600 text-xs font-bold">
                                        {selectedVoucher.code} (-{discountAmount.toLocaleString('vi-VN')}đ)
                                    </Text>
                                </View>
                            ) : (
                                <Text className="text-gray-400 text-xs mr-1">Chọn hoặc nhập mã</Text>
                            )}
                            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                        </View>
                    </TouchableOpacity>

                    {/* PHƯƠNG THỨC THANH TOÁN */}
                    <View className="bg-white p-4 rounded-xl mb-4 shadow-sm">
                        <Text className="font-bold text-gray-900 mb-3">Phương thức thanh toán</Text>

                        <TouchableOpacity
                            onPress={() => setPaymentMethod('COD')}
                            className={`flex-row items-center p-3 rounded-lg border mb-2 ${paymentMethod === 'COD' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}
                        >
                            <Ionicons name={paymentMethod === 'COD' ? "radio-button-on" : "radio-button-off"} size={20} color={paymentMethod === 'COD' ? "#2563EB" : "#9CA3AF"} />
                            <Text className="ml-3 text-gray-700 font-medium">Thanh toán khi nhận hàng (COD)</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setPaymentMethod('VNPAY')}
                            className={`flex-row items-center p-3 rounded-lg border ${paymentMethod === 'VNPAY' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}
                        >
                            <Ionicons name={paymentMethod === 'VNPAY' ? "radio-button-on" : "radio-button-off"} size={20} color={paymentMethod === 'VNPAY' ? "#2563EB" : "#9CA3AF"} />
                            <View className="ml-3 flex-row items-center">
                                <Text className="text-gray-700 font-medium mr-2">VNPAY</Text>
                                <Image source={{ uri: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Icon-VNPAY-QR.png' }} className="w-6 h-6" resizeMode="contain" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* GHI CHÚ */}
                    <View className="bg-white p-4 rounded-xl mb-4 shadow-sm">
                        <Text className="font-bold text-gray-900 mb-2">Ghi chú đơn hàng</Text>
                        <TextInput
                            placeholder="Lời nhắn cho người bán..."
                            className="bg-gray-50 p-3 rounded-lg text-gray-700 h-20"
                            multiline
                            textAlignVertical="top"
                            value={note}
                            onChangeText={setNote}
                        />
                    </View>

                    {/* CHI TIẾT THANH TOÁN */}
                    <View className="bg-white p-4 rounded-xl shadow-sm">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-500">Tổng tiền hàng</Text>
                            <Text className="text-gray-900">{totalPrice.toLocaleString('vi-VN')}đ</Text>
                        </View>
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-500">Phí vận chuyển</Text>
                            <Text className="text-gray-900">{shippingFee.toLocaleString('vi-VN')}đ</Text>
                        </View>

                        {discountAmount > 0 && (
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-gray-500">Voucher giảm giá</Text>
                                <Text className="text-green-600">-{discountAmount.toLocaleString('vi-VN')}đ</Text>
                            </View>
                        )}

                        <View className="border-t border-dashed border-gray-200 my-2" />
                        <View className="flex-row justify-between items-center">
                            <Text className="text-lg font-bold text-gray-900">Tổng thanh toán</Text>
                            <Text className="text-xl font-bold text-red-600">{finalTotal.toLocaleString('vi-VN')}đ</Text>
                        </View>
                    </View>
                </ScrollView>

                <View className="bg-white p-4 border-t border-gray-100 shadow-lg">
                    <CustomButton
                        title="Đặt Hàng"
                        onPress={handlePlaceOrder}
                        isLoading={loading}
                        variant="primary"
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}