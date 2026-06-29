import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import rateService from '../../api/rateService';

interface ReviewFormModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmitSuccess: () => void;
    orderDetailId: number;
}

export const ReviewFormModal = ({ visible, onClose, onSubmitSuccess, orderDetailId }: ReviewFormModalProps) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!comment.trim()) {
            alert('Vui lòng nhập nội dung đánh giá');
            return;
        }

        setIsSubmitting(true);
        try {
            await rateService.createRate({
                orderDetailId: orderDetailId,
                rating: rating,
                comment: comment
            });
            setComment('');
            setRating(5);
            onSubmitSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert('Có lỗi xảy ra khi gửi đánh giá');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-white rounded-t-3xl p-5 min-h-[50%]">
                    {/* Header */}
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-xl font-bold text-gray-900">Viết đánh giá</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Star Rating */}
                    <View className="items-center mb-6">
                        <Text className="text-gray-500 mb-3">Bạn cảm thấy sản phẩm thế nào?</Text>
                        <View className="flex-row gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                    <Ionicons 
                                        name={star <= rating ? "star" : "star-outline"} 
                                        size={40} 
                                        color="#FBBF24" 
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Comment Input */}
                    <View className="mb-6">
                        <Text className="text-gray-700 font-medium mb-2">Nhận xét của bạn</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl p-4 h-32 text-gray-800"
                            placeholder="Chia sẻ cảm nhận về sản phẩm..."
                            multiline
                            textAlignVertical="top"
                            value={comment}
                            onChangeText={setComment}
                        />
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity 
                        className={`bg-blue-600 rounded-xl py-4 items-center ${isSubmitting ? 'opacity-70' : ''}`}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-base">Gửi đánh giá</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};
