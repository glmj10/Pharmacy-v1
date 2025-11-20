import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Category } from '@/types';

interface CategoryBreadcrumbProps {
  category?: Category;
  onNavigate?: (category: Category | null) => void;
}

export const CategoryBreadcrumb: React.FC<CategoryBreadcrumbProps> = ({
  category,
  onNavigate,
}) => {
  if (!category) return null;

  // Build breadcrumb path
  const buildPath = (cat: Category): Category[] => {
    const path: Category[] = [];
    let current: Category | undefined = cat;

    while (current) {
      path.unshift(current);
      current = current.parent;
    }

    return path;
  };

  const path = buildPath(category);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <TouchableOpacity
        style={styles.breadcrumbItem}
        onPress={() => onNavigate?.(null)}
      >
        <Ionicons name="home-outline" size={16} color={Colors.textSecondary} />
      </TouchableOpacity>

      {path.map((cat, index) => (
        <View key={cat.id} style={styles.breadcrumbWrapper}>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={Colors.textLight}
            style={styles.separator}
          />
          <TouchableOpacity
            style={styles.breadcrumbItem}
            onPress={() => index < path.length - 1 && onNavigate?.(cat)}
            disabled={index === path.length - 1}
          >
            <Text
              style={[
                styles.breadcrumbText,
                index === path.length - 1 && styles.breadcrumbTextActive,
              ]}
              numberOfLines={1}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  breadcrumbWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    marginHorizontal: 8,
  },
  breadcrumbItem: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  breadcrumbText: {
    fontSize: 14,
    color: Colors.textSecondary,
    maxWidth: 120,
  },
  breadcrumbTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
