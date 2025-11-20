import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Category } from '@/types';
import { CategoryTree } from '@/components/CategoryTree';

interface CategoryModalProps {
  visible: boolean;
  categories: Category[];
  selectedCategory?: Category;
  onClose: () => void;
  onSelectCategory: (category: Category) => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  visible,
  categories,
  selectedCategory,
  onClose,
  onSelectCategory,
}) => {
  const handleSelectCategory = (category: Category) => {
    onSelectCategory(category);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chọn danh mục</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Category Tree */}
        <CategoryTree
          categories={categories}
          onSelectCategory={handleSelectCategory}
          selectedId={selectedCategory?.id}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
