import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const PolicySection = () => {
  const policies = [
    { icon: 'shield-checkmark', title: "Chính hãng", color: '#2563EB' },
    { icon: 'time', title: "Giao 2h", color: '#16A34A' },
    { icon: 'call', title: "Tư vấn 24/7", color: '#EA580C' },
    { icon: 'sync', title: "Đổi trả 30d", color: '#9333EA' },
  ];

  return (
    <View className="flex-row justify-between px-4 mb-6">
      {policies.map((item, idx) => (
        <View key={idx} className="items-center w-[23%] bg-white p-2 rounded-xl shadow-sm border border-gray-50">
            <Ionicons name={item.icon as any} size={24} color={item.color} />
            <Text className="text-[10px] text-center font-bold text-gray-700 mt-1">{item.title}</Text>
        </View>
      ))}
    </View>
  );
};
