import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Category } from '@/types';
import { CategoryModal } from '@/components/CategoryModal';
import { CategoryBreadcrumb } from '@/components/CategoryBreadcrumb';

// Mock data - Replace with API call
const MOCK_CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'Thuốc',
    slug: 'thuoc',
    thumbnail: 'https://via.placeholder.com/40',
    priority: 1,
    type: { id: 1, code: 'MEDICINE', name: 'Thuốc' },
    productCount: 150,
    children: [
      {
        id: 11,
        name: 'Thuốc kê đơn',
        slug: 'thuoc-ke-don',
        parentId: 1,
        priority: 1,
        productCount: 80,
        children: [
          {
            id: 111,
            name: 'Thuốc tim mạch',
            slug: 'thuoc-tim-mach',
            parentId: 11,
            productCount: 25,
            children: [],
          },
          {
            id: 112,
            name: 'Thuốc tiêu hóa',
            slug: 'thuoc-tieu-hoa',
            parentId: 11,
            productCount: 30,
            children: [],
          },
        ],
      },
      {
        id: 12,
        name: 'Thuốc không kê đơn',
        slug: 'thuoc-khong-ke-don',
        parentId: 1,
        priority: 2,
        productCount: 70,
        children: [
          {
            id: 121,
            name: 'Thuốc giảm đau',
            slug: 'thuoc-giam-dau',
            parentId: 12,
            productCount: 40,
            children: [],
          },
        ],
      },
    ],
  },
  {
    id: 2,
    name: 'Thực phẩm chức năng',
    slug: 'thuc-pham-chuc-nang',
    thumbnail: 'https://via.placeholder.com/40',
    priority: 2,
    type: { id: 2, code: 'SUPPLEMENT', name: 'TPCN' },
    productCount: 200,
    children: [
      {
        id: 21,
        name: 'Vitamin & Khoáng chất',
        slug: 'vitamin-khoang-chat',
        parentId: 2,
        priority: 1,
        productCount: 120,
        children: [
          {
            id: 211,
            name: 'Vitamin C',
            slug: 'vitamin-c',
            parentId: 21,
            productCount: 50,
            children: [],
          },
          {
            id: 212,
            name: 'Vitamin D',
            slug: 'vitamin-d',
            parentId: 21,
            productCount: 35,
            children: [],
          },
        ],
      },
      {
        id: 22,
        name: 'Dầu cá & Omega',
        slug: 'dau-ca-omega',
        parentId: 2,
        priority: 2,
        productCount: 80,
        children: [],
      },
    ],
  },
  {
    id: 3,
    name: 'Chăm sóc cá nhân',
    slug: 'cham-soc-ca-nhan',
    priority: 3,
    type: { id: 3, code: 'PERSONAL_CARE', name: 'Chăm sóc' },
    productCount: 180,
    children: [
      {
        id: 31,
        name: 'Chăm sóc da',
        slug: 'cham-soc-da',
        parentId: 3,
        productCount: 90,
        children: [],
      },
      {
        id: 32,
        name: 'Chăm sóc răng miệng',
        slug: 'cham-soc-rang-mieng',
        parentId: 3,
        productCount: 45,
        children: [],
      },
    ],
  },
];

export default function CategoryExampleScreen() {
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    console.log('Selected category:', category);
    // TODO: Navigate to products list with selected category
  };

  const handleBreadcrumbNavigate = (category: Category | null) => {
    if (category === null) {
      setSelectedCategory(undefined);
    } else {
      setSelectedCategory(category);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh mục sản phẩm</Text>
      </View>

      <ScrollView>
        {/* Breadcrumb */}
        {selectedCategory && (
          <View style={styles.breadcrumbContainer}>
            <CategoryBreadcrumb
              category={selectedCategory}
              onNavigate={handleBreadcrumbNavigate}
            />
          </View>
        )}

        {/* Selected Category Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danh mục đang chọn:</Text>
          {selectedCategory ? (
            <View style={styles.selectedCard}>
              <View style={styles.selectedInfo}>
                <Text style={styles.selectedName}>{selectedCategory.name}</Text>
                {selectedCategory.type && (
                  <Text style={styles.selectedType}>{selectedCategory.type.name}</Text>
                )}
                {selectedCategory.productCount !== undefined && (
                  <Text style={styles.selectedCount}>
                    {selectedCategory.productCount} sản phẩm
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSelectedCategory(undefined)}
              >
                <Ionicons name="close-circle" size={24} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.noSelection}>Chưa chọn danh mục nào</Text>
          )}
        </View>

        {/* Choose Category Button */}
        <TouchableOpacity
          style={styles.chooseButton}
          onPress={() => setShowModal(true)}
        >
          <Ionicons name="list-outline" size={24} color={Colors.surface} />
          <Text style={styles.chooseButtonText}>Chọn danh mục</Text>
        </TouchableOpacity>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Hướng dẫn sử dụng:</Text>
          <Text style={styles.instructionItem}>• Click "Chọn danh mục" để mở cây danh mục</Text>
          <Text style={styles.instructionItem}>• Click mũi tên để mở/đóng danh mục con</Text>
          <Text style={styles.instructionItem}>• Click vào tên danh mục để chọn</Text>
          <Text style={styles.instructionItem}>• Breadcrumb hiển thị đường dẫn của danh mục</Text>
          <Text style={styles.instructionItem}>• Có badge hiển thị số lượng sản phẩm</Text>
        </View>
      </ScrollView>

      {/* Category Modal */}
      <CategoryModal
        visible={showModal}
        categories={MOCK_CATEGORIES}
        selectedCategory={selectedCategory}
        onClose={() => setShowModal(false)}
        onSelectCategory={handleSelectCategory}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  breadcrumbContainer: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  selectedCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedInfo: {
    flex: 1,
  },
  selectedName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  selectedType: {
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 4,
  },
  selectedCount: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  clearButton: {
    padding: 4,
  },
  noSelection: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  chooseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  chooseButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.surface,
  },
  instructionsCard: {
    backgroundColor: Colors.surface,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.info,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  instructionItem: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
});
