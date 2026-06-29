import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RenderHtml from 'react-native-render-html';
import { SafeAreaView } from 'react-native-safe-area-context';

interface DescriptionModalProps {
  visible: boolean;
  onClose: () => void;
  content: string;
  title?: string;
}

export const DescriptionModal = ({ visible, onClose, content, title = "Mô tả sản phẩm" }: DescriptionModalProps) => {
  const { width } = useWindowDimensions();

  // Style cho HTML bên trong Modal
  const htmlTagsStyles = {
    body: { color: '#374151', fontSize: 16, lineHeight: 26 }, // Gray-700
    p: { marginBottom: 12 },
    ul: { marginBottom: 12, marginLeft: 20 },
    li: { marginBottom: 6 },
    strong: { color: '#111827', fontWeight: 'bold' as 'bold' }, // Gray-900
    h1: { fontSize: 22, fontWeight: 'bold' as 'bold', marginVertical: 12, color: '#2563EB' },
    h2: { fontSize: 19, fontWeight: 'bold' as 'bold', marginVertical: 10, color: '#1F2937' },
    img: { marginVertical: 10, borderRadius: 8 },
  };

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-white">
        {/* Header Modal */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100 bg-white shadow-sm z-10">
            <Text className="text-lg font-bold text-gray-900 flex-1" numberOfLines={1}>
                {title}
            </Text>
            <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 rounded-full">
                <Ionicons name="close" size={24} color="#4B5563" />
            </TouchableOpacity>
        </View>

        {/* Nội dung Scroll */}
        <ScrollView 
            className="flex-1 px-4" 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40, paddingTop: 10 }}
        >
            {content ? (
                <RenderHtml
                    contentWidth={width - 32} // Trừ padding
                    source={{ html: content }}
                    tagsStyles={htmlTagsStyles}
                    enableExperimentalMarginCollapsing={true}
                />
            ) : (
                <Text className="text-gray-500 italic mt-4 text-center">Nội dung đang cập nhật...</Text>
            )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};