import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import voucherService from '../../src/api/voucherService';
import VoucherCard from '../../src/components/voucher/VoucherCard';
import { Voucher } from '../../src/types/voucher';

// ─── Hằng số ───────────────────────────────────────────────────────────────
const STATUS_TABS: { label: string; value: string | undefined }[] = [
  { label: 'Tất cả', value: undefined },
  { label: 'Còn hạn', value: 'ACTIVE' },
  { label: 'Hết hạn', value: 'EXPIRED' },
];

const TYPE_FILTERS: { label: string; value: string | undefined }[] = [
  { label: 'Tất cả', value: undefined },
  { label: 'Công khai', value: 'PUBLIC' },
  { label: 'Riêng tư', value: 'PRIVATE' },
];

// ─── Mapper ────────────────────────────────────────────────────────────────
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
    claimed: res.claimed ?? true,
    maxDiscountAmount: res.maxDiscountAmount,
    minOrderValue: res.minOrderValue,
    usageLimit: res.usageLimit,
    usageLimitPerUser: res.usageLimitPerUser,
    status: res.status,
  };
}

// ─── Màu badge trạng thái ─────────────────────────────────────────────────
function getStatusStyle(status: string) {
  switch (status) {
    case 'ACTIVE':
      return { bg: 'bg-green-100', text: 'text-green-700', label: 'Còn hạn' };
    case 'EXPIRED':
      return { bg: 'bg-orange-100', text: 'text-orange-600', label: 'Hết hạn' };
    case 'CANCELLED':
      return { bg: 'bg-red-100', text: 'text-red-600', label: 'Đã hủy' };
    case 'INACTIVE':
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Vô hiệu' };
  }
}

// ─── Screen ────────────────────────────────────────────────────────────────
export default function MyVoucherScreen() {
  const router = useRouter();

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [activeStatus, setActiveStatus] = useState<string | undefined>(undefined);
  const [activeType, setActiveType] = useState<string | undefined>(undefined);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ─── Fetch ───────────────────────────────────────────────────────────────
  const fetchVouchers = async (
    pageIndex: number,
    status: string | undefined,
    type: string | undefined,
    append = false
  ) => {
    try {
      const res = await voucherService.getUserVouchers(pageIndex, 10, type, status);
      const pageData = res.data?.data;
      if (pageData) {
        const mapped = Array.isArray(pageData.content)
          ? pageData.content.map(mapVoucherResponse)
          : [];
        setVouchers((prev) => (append ? [...prev, ...mapped] : mapped));
        setTotalPages(pageData.totalPages ?? 1);
        setPage(pageData.currentPage ?? pageIndex);
      }
    } catch (error) {
      console.error('Lỗi tải voucher:', error);
    }
  };

  // Lần đầu / khi đổi filter
  useEffect(() => {
    setLoading(true);
    setVouchers([]);
    fetchVouchers(1, activeStatus, activeType).finally(() => setLoading(false));
  }, [activeStatus, activeType]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchVouchers(1, activeStatus, activeType);
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    await fetchVouchers(page + 1, activeStatus, activeType, true);
    setLoadingMore(false);
  };

  const handleUse = (voucher: Voucher) => {
    router.push('/(tabs)/products');
  };

  // ─── Render item ─────────────────────────────────────────────────────────
  const renderItem = useCallback(
    ({ item }: { item: Voucher }) => {
      const statusStyle = getStatusStyle(item.status);
      const isUsable = item.status === 'ACTIVE';
      const badge = (
        <View className={`px-2 py-0.5 rounded-full ${statusStyle.bg}`}>
          <Text className={`text-[10px] font-semibold ${statusStyle.text}`}>
            {statusStyle.label}
          </Text>
        </View>
      );
      return (
        <View style={{ opacity: isUsable ? 1 : 0.6 }}>
          <VoucherCard
            voucher={item}
            isMyVoucher={true}
            claimed={true}
            onUse={isUsable ? handleUse : undefined}
            statusBadge={badge}
          />
        </View>
      );
    },
    []
  );

  // ─── UI ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom', 'left', 'right', 'top']}>
      <Stack.Screen
        options={{
          title: 'Ví Voucher',
          headerStyle: { backgroundColor: '#fff' },
          headerShadowVisible: false,
          headerTintColor: '#1F2937',
        }}
      />
      <StatusBar barStyle="dark-content" />

      {/* ── Status Tabs ── */}
      <View className="bg-white border-b border-gray-100">
        <FlatList
          data={STATUS_TABS}
          horizontal
          keyExtractor={(item) => item.label}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10 }}
          renderItem={({ item }) => {
            const active = activeStatus === item.value;
            return (
              <TouchableOpacity
                onPress={() => setActiveStatus(item.value)}
                className={`px-4 py-1.5 rounded-full mr-2 ${
                  active ? 'bg-blue-600' : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    active ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        {/* ── Type Filter ── */}
        <FlatList
          data={TYPE_FILTERS}
          horizontal
          keyExtractor={(item) => item.label}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 10 }}
          renderItem={({ item }) => {
            const active = activeType === item.value;
            return (
              <TouchableOpacity
                onPress={() => setActiveType(item.value)}
                className={`flex-row items-center px-3 py-1 rounded-full mr-2 border ${
                  active ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                }`}
              >
                {active && (
                  <Ionicons name="checkmark" size={12} color="#2563EB" style={{ marginRight: 3 }} />
                )}
                <Text
                  className={`text-xs font-medium ${
                    active ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* ── Content ── */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={vouchers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#2563EB']}
              tintColor="#2563EB"
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#2563EB" />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View className="items-center mt-20">
              <View className="bg-blue-50 p-6 rounded-full mb-4">
                <Ionicons name="wallet-outline" size={48} color="#2563EB" />
              </View>
              <Text className="text-gray-900 font-bold text-lg">Không có voucher</Text>
              <Text className="text-gray-500 text-center mt-2 px-8">
                {activeStatus || activeType
                  ? 'Không có voucher phù hợp với bộ lọc hiện tại.'
                  : 'Bạn chưa lưu voucher nào. Hãy săn voucher ngay để nhận ưu đãi!'}
              </Text>
              {!activeStatus && !activeType && (
                <TouchableOpacity
                  className="mt-6 bg-blue-600 px-6 py-2.5 rounded-full shadow-sm"
                  onPress={() => router.push('/vouchers')}
                >
                  <Text className="text-white font-bold">Săn Voucher Ngay</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
