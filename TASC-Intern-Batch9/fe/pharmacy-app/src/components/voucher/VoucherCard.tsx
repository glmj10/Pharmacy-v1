import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Voucher } from '../../types/voucher';

interface VoucherCardProps {
  voucher: Voucher;
  onClaim?: (id: number) => void;
  onUse?: (voucher: Voucher) => void;
  claimed?: boolean;
  isMyVoucher?: boolean;
  // Badge trạng thái truyền từ ngoài vào (dùng ở ví)
  statusBadge?: React.ReactNode;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getStatusStyle(status: string) {
  switch (status) {
    case 'ACTIVE':   return { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Còn hạn' };
    case 'EXPIRED':  return { bg: 'bg-orange-100', text: 'text-orange-600', label: 'Hết hạn' };
    case 'CANCELLED':return { bg: 'bg-red-100',    text: 'text-red-600',    label: 'Đã hủy' };
    default:         return { bg: 'bg-gray-100',   text: 'text-gray-500',   label: 'Vô hiệu' };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
const VoucherCard: React.FC<VoucherCardProps> = ({
  voucher,
  onClaim,
  onUse,
  claimed,
  isMyVoucher = false,
  statusBadge,
}) => {
  const [showDetail, setShowDetail] = useState(false);

  const endDateStr   = formatDateTime(voucher.endDate);
  const startDateStr = formatDateTime(voucher.startDate);
  const isPercent    = voucher.discountType === 'PERCENTAGE';
  const displayValue = isPercent
    ? `${voucher.discountValue}%`
    : `${voucher.discountValue.toLocaleString()}đ`;

  const isPublic  = voucher.type === 'PUBLIC';
  const canUseNow = isPublic || isMyVoucher;

  // Progress Bar
  const usageLimit     = voucher.usageLimit || 100;
  const collected      = voucher.collectedCount || 0;
  const progressPercent = Math.min(Math.round((collected / usageLimit) * 100), 100);

  const statusStyle = getStatusStyle(voucher.status);
  const isUsable    = voucher.status === 'ACTIVE' && !voucher.used;

  const handleUseNow = () => {
    setShowDetail(false);
    onUse && onUse(voucher);
  };

  return (
    <>
      {/* ── Card ── */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setShowDetail(true)}
        className="flex-row bg-white rounded-xl mb-4 shadow-sm border border-gray-100 overflow-hidden h-32"
      >
        {/* Left Side */}
        <View className={`w-[30%] ${isMyVoucher ? 'bg-blue-600' : 'bg-orange-500'} items-center justify-center relative`}>
          <View className="w-3 h-3 bg-gray-50 absolute -top-1.5 left-1/2 -ml-1.5 rounded-full" />
          <View className="w-3 h-3 bg-gray-50 absolute -bottom-1.5 left-1/2 -ml-1.5 rounded-full" />
          <Ionicons name="ticket-outline" size={32} color="white" />
          <Text className="text-white font-bold text-xs mt-1 text-center px-1">
            {isPublic ? 'PUBLIC' : isMyVoucher ? 'MY VOUCHER' : 'VOUCHER'}
          </Text>
        </View>

        {/* Right Side */}
        <View className="flex-1 p-3 justify-between">
          <View>
            <View className="flex-row justify-between items-start">
              <Text className="text-base font-bold text-gray-800 flex-1 mr-2" numberOfLines={1}>
                Giảm {displayValue}
              </Text>
              {/* Badge trạng thái (ví) hoặc link điều kiện (kho) */}
              {statusBadge ? (
                statusBadge
              ) : (
                <TouchableOpacity onPress={() => setShowDetail(true)}>
                  <Text className="text-blue-500 text-[10px] underline">Điều kiện</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text className="text-xs text-gray-500 mt-1" numberOfLines={1}>
              Đơn tối thiểu {voucher.minOrderValue.toLocaleString()}đ
            </Text>

            {!isMyVoucher && (
              <View className="mt-2">
                <View className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <View style={{ width: `${progressPercent}%` }} className="h-full bg-orange-400" />
                </View>
                <Text className="text-[10px] text-gray-400 mt-0.5">Đã dùng {progressPercent}%</Text>
              </View>
            )}

            {isMyVoucher && (
              <Text className="text-[10px] text-gray-400 mt-1">HSD: {endDateStr}</Text>
            )}
          </View>

          <View className="flex-row justify-between items-end">
            <View className="bg-gray-50 px-2 py-0.5 rounded border border-gray-200 border-dashed">
              <Text className="text-gray-500 font-bold text-[10px]">{voucher.code}</Text>
            </View>

            {canUseNow ? (
              <TouchableOpacity
                className={`px-4 py-1.5 rounded-full shadow-sm ${isUsable || !isMyVoucher ? 'bg-blue-600' : 'bg-gray-300'}`}
                onPress={handleUseNow}
                disabled={isMyVoucher && !isUsable}
              >
                <Text className="font-bold text-xs text-white">Dùng ngay</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                className={`px-4 py-1.5 rounded-full ${claimed ? 'bg-gray-100' : 'bg-orange-500'} shadow-sm`}
                onPress={() => !claimed && onClaim && onClaim(voucher.id)}
                disabled={claimed}
              >
                <Text className={`font-bold text-xs ${claimed ? 'text-gray-400' : 'text-white'}`}>
                  {claimed ? 'Đã nhận' : 'Lưu mã'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Divider decorations */}
        <View className="absolute top-0 bottom-0 left-[30%] w-[1px] border-l border-dashed border-gray-300 ml-[-0.5px]" />
        <View className="absolute -top-1.5 left-[30%] -ml-1.5 w-3 h-3 bg-gray-50 rounded-full" />
        <View className="absolute -bottom-1.5 left-[30%] -ml-1.5 w-3 h-3 bg-gray-50 rounded-full" />
      </TouchableOpacity>

      {/* ── Detail Modal ── */}
      <Modal
        visible={showDetail}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetail(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
          onPress={() => setShowDetail(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View className="bg-white rounded-t-3xl px-5 pt-6 pb-10">
              {/* Drag handle */}
              <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-5" />

              {/* Header */}
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-bold text-gray-900">Chi tiết voucher</Text>
                <TouchableOpacity onPress={() => setShowDetail(false)}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Code box */}
              <View className="bg-blue-50 border border-blue-200 border-dashed rounded-xl p-4 items-center mb-5">
                <Text className="text-2xl font-bold text-blue-700 tracking-widest">{voucher.code}</Text>
                {voucher.status && (
                  <View className={`mt-2 px-3 py-0.5 rounded-full ${statusStyle.bg}`}>
                    <Text className={`text-xs font-semibold ${statusStyle.text}`}>{statusStyle.label}</Text>
                  </View>
                )}
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 340 }}>
                {([
                  { label: 'Mức giảm',        value: displayValue,                              highlight: true },
                  { label: 'Loại giảm',       value: isPercent ? 'Phần trăm (%)' : 'Số tiền cố định' },
                  { label: 'Loại voucher',    value: isPublic ? 'Công khai' : 'Riêng tư' },
                  { label: 'Đơn tối thiểu',   value: `${voucher.minOrderValue.toLocaleString()}đ` },
                  { label: 'Giảm tối đa',     value: `${voucher.maxDiscountAmount.toLocaleString()}đ` },
                  { label: 'Giới hạn / người',value: `${voucher.usageLimitPerUser} lần` },
                  { label: 'Hiệu lực từ',     value: startDateStr },
                  { label: 'Hết hạn lúc',     value: endDateStr, warn: !isUsable },
                ] as { label: string; value: string; highlight?: boolean; warn?: boolean }[]).map((row) => (
                  <View key={row.label} className="flex-row justify-between py-3 border-b border-gray-50">
                    <Text className="text-gray-500 text-sm">{row.label}</Text>
                    <Text className={`text-sm font-semibold ${
                      row.highlight ? 'text-blue-600' : row.warn ? 'text-orange-500' : 'text-gray-800'
                    }`}>
                      {row.value}
                    </Text>
                  </View>
                ))}

                {!!voucher.description && (
                  <View className="mt-4 mb-2">
                    <Text className="text-gray-500 text-sm mb-1">Mô tả</Text>
                    <Text className="text-gray-700 text-sm leading-5">{voucher.description}</Text>
                  </View>
                )}
              </ScrollView>

              {/* CTA */}
              {canUseNow && isUsable && (
                <TouchableOpacity
                  onPress={handleUseNow}
                  className="mt-6 bg-blue-600 py-3.5 rounded-xl items-center"
                >
                  <Text className="text-white font-bold text-base">Dùng ngay</Text>
                </TouchableOpacity>
              )}
              {!canUseNow && !claimed && (
                <TouchableOpacity
                  onPress={() => { setShowDetail(false); onClaim && onClaim(voucher.id); }}
                  className="mt-6 bg-orange-500 py-3.5 rounded-xl items-center"
                >
                  <Text className="text-white font-bold text-base">Lưu mã ngay</Text>
                </TouchableOpacity>
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

export default VoucherCard;

