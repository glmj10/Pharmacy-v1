import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CustomButton } from './CustomButton';
import { useAppSelector } from '../store/hooks';
import { CategoryItem } from './CategoryItem'; // Đảm bảo bạn đã tạo file này ở bước trước

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  // Truyền object chứa đầy đủ tham số lọc
  onApply: (filters: { 
    priceFrom?: number; 
    priceTo?: number; 
    isAscending?: boolean;
    brandSlug?: string;
    category?: string; 
  }) => void;
  // Nhận giá trị hiện tại để hiển thị lại khi mở modal
  initialFilters?: any;
}

export const FilterModal = ({ visible, onClose, onApply, initialFilters }: FilterModalProps) => {
  // Lấy data từ Redux (đã fetch ở Home)
  const { brands, categories } = useAppSelector((state) => state.products);

  // State tạm thời của Modal
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [sortOption, setSortOption] = useState<'asc' | 'desc' | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Reset/Fill lại data khi mở Modal
  useEffect(() => {
    if (visible) {
      setPriceFrom(initialFilters?.priceFrom?.toString() || '');
      setPriceTo(initialFilters?.priceTo?.toString() || '');
      setSortOption(initialFilters?.isAscending === true ? 'asc' : initialFilters?.isAscending === false ? 'desc' : null);
      setSelectedBrand(initialFilters?.brandSlug || null);
      setSelectedCategory(initialFilters?.category || null);
    }
  }, [visible, initialFilters]);

  const handleApply = () => {
    onApply({
      priceFrom: priceFrom ? Number(priceFrom) : undefined,
      priceTo: priceTo ? Number(priceTo) : undefined,
      isAscending: sortOption === null ? undefined : sortOption === 'asc',
      brandSlug: selectedBrand || undefined,
      category: selectedCategory || undefined,
    });
    onClose();
  };

  const handleReset = () => {
    setPriceFrom('');
    setPriceTo('');
    setSortOption(null);
    setSelectedBrand(null);
    setSelectedCategory(null);
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl h-[90%] w-full flex-col"> 
          
          {/* Header */}
          <View className="flex-row justify-between items-center p-5 border-b border-gray-100">
            <Text className="text-xl font-bold text-gray-900">Bộ lọc & Tìm kiếm</Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <Ionicons name="close" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
            
            {/* 1. KHOẢNG GIÁ */}
            <Text className="font-bold text-gray-800 mb-3 text-base">Khoảng giá (VNĐ)</Text>
            <View className="flex-row items-center justify-between mb-6">
              <TextInput
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl h-12 px-3 text-center text-gray-900"
                placeholder="0"
                keyboardType="numeric"
                value={priceFrom}
                onChangeText={setPriceFrom}
              />
              <Text className="mx-3 text-gray-400 font-bold">-</Text>
              <TextInput
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl h-12 px-3 text-center text-gray-900"
                placeholder="Tối đa"
                keyboardType="numeric"
                value={priceTo}
                onChangeText={setPriceTo}
              />
            </View>

            {/* 2. THƯƠNG HIỆU (Horizontal Scroll) */}
            <Text className="font-bold text-gray-800 mb-3 text-base">Thương hiệu</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                <TouchableOpacity 
                    onPress={() => setSelectedBrand(null)}
                    className={`mr-2 px-5 py-2.5 rounded-full border ${!selectedBrand ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'}`}
                >
                    <Text className={`font-medium ${!selectedBrand ? 'text-white' : 'text-gray-600'}`}>Tất cả</Text>
                </TouchableOpacity>
                
                {brands.map((brand) => (
                    <TouchableOpacity 
                        key={brand.id}
                        onPress={() => setSelectedBrand(brand.slug)}
                        className={`mr-2 px-5 py-2.5 rounded-full border ${selectedBrand === brand.slug ? 'bg-blue-50 border-blue-600' : 'bg-white border-gray-200'}`}
                    >
                        <Text className={`font-medium ${selectedBrand === brand.slug ? 'text-blue-600' : 'text-gray-600'}`}>
                            {brand.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* 3. DANH MỤC (Tree List) */}
            <Text className="font-bold text-gray-800 mb-3 text-base">Danh mục</Text>
            <View className="border border-gray-200 rounded-2xl p-2 mb-6 bg-gray-50/30">
               <TouchableOpacity 
                  onPress={() => setSelectedCategory(null)} 
                  className="p-3 border-b border-gray-100 flex-row items-center"
               >
                   <View className={`w-5 h-5 rounded-full border mr-3 items-center justify-center ${!selectedCategory ? 'border-blue-600' : 'border-gray-300'}`}>
                      {!selectedCategory && <View className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                   </View>
                   <Text className={`text-base ${!selectedCategory ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>Tất cả danh mục</Text>
               </TouchableOpacity>
               
               {categories.map((cat) => (
                   <CategoryItem 
                      key={cat.id} 
                      category={cat} 
                      selectedSlug={selectedCategory || ''}
                      onSelect={(slug) => setSelectedCategory(slug)}
                   />
               ))}
            </View>

            {/* 4. SẮP XẾP */}
            <Text className="font-bold text-gray-800 mb-3 text-base">Sắp xếp</Text>
            <View className="flex-row gap-3 mb-10">
              <TouchableOpacity
                onPress={() => setSortOption('asc')}
                className={`flex-1 h-12 rounded-xl border items-center justify-center ${
                  sortOption === 'asc' ? 'bg-blue-50 border-blue-600' : 'bg-white border-gray-200'
                }`}
              >
                <Text className={sortOption === 'asc' ? 'text-blue-600 font-bold' : 'text-gray-600'}>Thấp đến cao</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSortOption('desc')}
                className={`flex-1 h-12 rounded-xl border items-center justify-center ${
                  sortOption === 'desc' ? 'bg-blue-50 border-blue-600' : 'bg-white border-gray-200'
                }`}
              >
                <Text className={sortOption === 'desc' ? 'text-blue-600 font-bold' : 'text-gray-600'}>Cao đến thấp</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View className="p-5 border-t border-gray-100 flex-row gap-4 bg-white pb-8">
            <TouchableOpacity 
                onPress={handleReset}
                className="flex-1 h-14 rounded-xl border border-gray-300 items-center justify-center"
            >
                <Text className="text-gray-700 font-bold text-base">Đặt lại</Text>
            </TouchableOpacity>
            <View className="flex-1">
                <CustomButton title="Áp dụng" onPress={handleApply} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};