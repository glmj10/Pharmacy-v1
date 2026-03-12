import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../types/category';

interface CategoryItemProps {
  category: Category;
  selectedSlug?: string;
  onSelect: (slug: string) => void;
  level?: number; // Độ sâu của cấp (để thụt lề)
}

export const CategoryItem = ({ category, selectedSlug, onSelect, level = 0 }: CategoryItemProps) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;
  const isSelected = selectedSlug === category.slug;

  const handlePress = () => {
    if (hasChildren) {
      setExpanded(!expanded); // Nếu có con thì mở rộng
    } else {
      onSelect(category.slug); // Nếu không có con thì chọn luôn
    }
  };

  const handleSelectSelf = () => {
    onSelect(category.slug);
  }

  return (
    <View>
      <View className="flex-row items-center py-2" style={{ paddingLeft: level * 16 }}>
        {/* Nút mũi tên mở rộng (chỉ hiện nếu có con) */}
        {hasChildren ? (
          <TouchableOpacity onPress={() => setExpanded(!expanded)} className="p-1 mr-1">
            <Ionicons 
                name={expanded ? "chevron-down" : "chevron-forward"} 
                size={18} 
                color="#6B7280" 
            />
          </TouchableOpacity>
        ) : (
          <View className="w-6 mr-1" /> // Placeholder để căn lề
        )}

        {/* Tên danh mục (Click để chọn) */}
        <TouchableOpacity 
            onPress={handleSelectSelf} 
            className="flex-1 flex-row items-center"
        >
            <Text className={`text-base ${isSelected ? 'text-blue-600 font-bold' : 'text-gray-700'}`}>
                {category.name}
            </Text>
            {isSelected && <Ionicons name="checkmark" size={18} color="#2563EB" className="ml-2" />}
        </TouchableOpacity>
      </View>

      {/* Render đệ quy các con */}
      {expanded && hasChildren && (
        <View>
          {category.children!.map((child) => (
            <CategoryItem 
                key={child.id} 
                category={child} 
                selectedSlug={selectedSlug} 
                onSelect={onSelect}
                level={level + 1} 
            />
          ))}
        </View>
      )}
    </View>
  );
};