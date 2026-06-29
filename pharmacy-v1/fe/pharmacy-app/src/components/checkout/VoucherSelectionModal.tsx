import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import voucherService from '../../api/voucherService';
import { Voucher } from '../../types/voucher';
import VoucherCard from '../voucher/VoucherCard';

interface VoucherSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (voucher: Voucher) => void;
  orderTotal: number;
}

export const VoucherSelectionModal: React.FC<VoucherSelectionModalProps> = ({ 
  visible, 
  onClose, 
  onSelect,
  orderTotal 
}) => {
  const [activeTab, setActiveTab] = useState<'public' | 'private'>('public');
  const [loading, setLoading] = useState(false);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);

  useEffect(() => {
    if (visible) {
      fetchVouchers();
    }
  }, [visible, activeTab]);

  function mapVoucherResponse(res: any): Voucher {
    return {
        id: res.id,
        code: res.code,
        description: res.description,
        type: res.type,
        discountType: res.discountType,
        discountValue: res.discountValue,
        startDate: res.startDate,
        endDate: res.endDate,
        claimed: res.claimed || false,
        used: res.used || false,
        maxDiscountAmount: res.maxDiscountAmount,
        minOrderValue: res.minOrderValue,
        usageLimit: res.usageLimit,
        usageLimitPerUser: res.usageLimitPerUser,
        status: res.status
    };
  }

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      let res;
      if (activeTab === 'public') {
        res = await voucherService.getVouchers();
      } else {
        res = await voucherService.getUserVouchers();
      }

      if (res.data && res.data.data && Array.isArray(res.data.data.content)) {
        const mapped = res.data.data.content.map(mapVoucherResponse);
        const filtered = mapped.filter((v: Voucher) => v.status === 'ACTIVE' && !v.used);
        setVouchers(filtered);
      } else {
        setVouchers([]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể tải danh sách voucher');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (voucher: Voucher) => {
    if (orderTotal < voucher.minOrderValue) {
      Alert.alert(
        'Không đủ điều kiện', 
        `Đơn hàng tối thiểu phải từ ${voucher.minOrderValue.toLocaleString()}đ để sử dụng voucher này.`
      );
      return;
    }
    
    const now = new Date();
    const endDate = new Date(voucher.endDate);
    if (now > endDate) {
       Alert.alert('Lỗi', 'Voucher đã hết hạn sử dụng');
       return;
    }

    onSelect(voucher);
    onClose();
  };

  const handleClaim = async (id: number) => {
      try {
        await voucherService.claimVoucher({ voucherId: id });
        Alert.alert('Thành công', 'Đã lưu voucher. Bạn có thể sử dụng ngay!');
        fetchVouchers();
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể lưu voucher này');
      }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-slate-50 rounded-t-3xl h-[85%] overflow-hidden">
            <View className="bg-white p-4 items-center border-b border-gray-100 flex-row justify-between">
                <TouchableOpacity onPress={onClose} className="p-2">
                    <Ionicons name="close" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-800">Chọn Voucher</Text>
                <View className="w-10" /> 
            </View>

            <View className="flex-row bg-white">
                <TouchableOpacity 
                    className={`flex-1 py-4 border-b-2 ${activeTab === 'public' ? 'border-blue-600' : 'border-transparent'}`}
                    onPress={() => setActiveTab('public')}
                >
                    <Text className={`text-center font-bold ${activeTab === 'public' ? 'text-blue-600' : 'text-gray-500'}`}>
                        Voucher Shop
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    className={`flex-1 py-4 border-b-2 ${activeTab === 'private' ? 'border-blue-600' : 'border-transparent'}`}
                    onPress={() => setActiveTab('private')}
                >
                    <Text className={`text-center font-bold ${activeTab === 'private' ? 'text-blue-600' : 'text-gray-500'}`}>
                        Kho Voucher
                    </Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            ) : (
                <FlatList
                    data={vouchers}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item }) => {
                        const isApplicable = orderTotal >= item.minOrderValue;
                        return (
                            <View className={!isApplicable ? 'opacity-50' : ''}>
                                <VoucherCard 
                                    voucher={item}
                                    isMyVoucher={activeTab === 'private'}
                                    claimed={item.claimed}
                                    onUse={() => handleSelect(item)}
                                    // Override onClaim needed? VoucherCard uses internal status but we pass handleClaim
                                    onClaim={handleClaim}
                                />
                                {!isApplicable && (
                                    <Text className="text-red-500 text-xs text-center -mt-2 mb-4">
                                        Chưa đủ điều kiện (Tối thiểu {item.minOrderValue.toLocaleString()}đ)
                                    </Text>
                                )}
                            </View>
                        );
                    }}
                    ListEmptyComponent={
                        <View className="items-center mt-10">
                            <Ionicons name="ticket-outline" size={48} color="#D1D5DB" />
                            <Text className="text-gray-500 mt-2">Không tìm thấy voucher nào</Text>
                        </View>
                    }
                />
            )}
        </View>
      </View>
    </Modal>
  );
};
