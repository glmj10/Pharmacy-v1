import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Promotion } from '../../types/promotion';
import { useRouter } from 'expo-router';

interface PromotionCardProps {
  promotion: Promotion;
}

// Tính số giây còn lại đến targetTime
const getSecondsLeft = (targetTime: string) => {
  const diff = Math.floor((new Date(targetTime).getTime() - Date.now()) / 1000);
  return diff > 0 ? diff : 0;
};

// Chuyển giây thành object { days, hours, minutes, seconds }
const parseCountdown = (totalSeconds: number) => {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
};

const pad = (n: number) => String(n).padStart(2, '0');

const CountdownBlock = ({ value, label }: { value: number; label: string }) => (
  <View className="items-center mx-1">
    <View className="bg-white/20 rounded-lg px-2 py-1 min-w-[36px] items-center">
      <Text className="text-white font-bold text-base">{pad(value)}</Text>
    </View>
    <Text className="text-white/80 text-[10px] mt-0.5">{label}</Text>
  </View>
);

const PromotionCard: React.FC<PromotionCardProps> = ({ promotion }) => {
  const router = useRouter();

  // Đếm ngược đến endTime nếu ONGOING, đến startTime nếu UPCOMING
  const targetTime = promotion.status === 'ONGOING' ? promotion.endTime : promotion.startTime;
  const [secondsLeft, setSecondsLeft] = useState(() => getSecondsLeft(targetTime));

  useEffect(() => {
    if (promotion.status === 'ENDED' || promotion.status === 'CANCELLED') return;
    const timer = setInterval(() => {
      setSecondsLeft(getSecondsLeft(targetTime));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetTime, promotion.status]);

  const { days, hours, minutes, seconds } = parseCountdown(secondsLeft);
  const isOngoing = promotion.status === 'ONGOING';
  const isUpcoming = promotion.status === 'UPCOMING';
  const showCountdown = (isOngoing || isUpcoming) && secondsLeft > 0;

  return (
    <TouchableOpacity
      className="bg-white rounded-xl mb-4 shadow-sm overflow-hidden"
      onPress={() => router.push(`/promotions/${promotion.id}`)}
      activeOpacity={0.9}
    >
      {/* Thumbnail */}
      <View className="relative">
        <Image
          source={{ uri: promotion.thumbnailUrl }}
          className="w-full h-44 bg-gray-200"
          resizeMode="cover"
        />

        {/* Overlay đếm ngược đè lên ảnh */}
        {showCountdown && (
          <View className={`absolute bottom-0 left-0 right-0 px-4 py-2 flex-row items-center justify-between ${isOngoing ? 'bg-red-500/85' : 'bg-blue-600/85'}`}>
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={14} color="white" />
              <Text className="text-white text-xs font-semibold ml-1">
                {isOngoing ? 'Kết thúc sau:' : 'Bắt đầu sau:'}
              </Text>
            </View>
            <View className="flex-row items-center">
              {days > 0 && <CountdownBlock value={days} label="ngày" />}
              <CountdownBlock value={hours} label="giờ" />
              <Text className="text-white font-bold text-base mb-3">:</Text>
              <CountdownBlock value={minutes} label="phút" />
              <Text className="text-white font-bold text-base mb-3">:</Text>
              <CountdownBlock value={seconds} label="giây" />
            </View>
          </View>
        )}
      </View>

      {/* Info */}
      <View className="p-4">
        <Text className="text-gray-800 font-bold text-base mb-2">{promotion.name}</Text>
        <View className="flex-row items-center justify-between">
          <Text className={`text-xs font-semibold px-2 py-1 rounded-md ${
            isOngoing ? 'bg-green-100 text-green-700' :
            isUpcoming ? 'bg-blue-100 text-blue-700' :
            'bg-gray-100 text-gray-500'
          }`}>
            {isOngoing ? '🔥 Đang diễn ra' : isUpcoming ? '⏳ Sắp diễn ra' : 'Đã kết thúc'}
          </Text>
          <Text className="text-gray-400 text-xs">
            {new Date(promotion.startTime).toLocaleDateString('vi-VN')} – {new Date(promotion.endTime).toLocaleDateString('vi-VN')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default PromotionCard;
