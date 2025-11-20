import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Category } from '@/types';

interface CategoryTreeItemProps {
  category: Category;
  level?: number;
  onPress: (category: Category) => void;
  selectedId?: number;
}

export const CategoryTreeItem: React.FC<CategoryTreeItemProps> = ({
  category,
  level = 0,
  onPress,
  selectedId,
}) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;
  const isSelected = category.id === selectedId;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.itemContainer,
          { paddingLeft: 16 + level * 20 },
          isSelected && styles.itemSelected,
        ]}
        onPress={() => onPress(category)}
      >
        {/* Expand/Collapse Icon */}
        {hasChildren ? (
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setExpanded(!expanded)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={expanded ? 'chevron-down' : 'chevron-forward'}
              size={18}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.expandButton} />
        )}

        {/* Category Icon/Image */}
        {category.thumbnail ? (
          <Image
            source={{ uri: category.thumbnail }}
            style={styles.categoryImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.categoryIcon, { backgroundColor: Colors.primary + '20' }]}>
            <Ionicons name="folder-outline" size={20} color={Colors.primary} />
          </View>
        )}

        {/* Category Info */}
        <View style={styles.categoryInfo}>
          <Text
            style={[
              styles.categoryName,
              isSelected && styles.categoryNameSelected,
              level === 0 && styles.categoryNameRoot,
            ]}
            numberOfLines={1}
          >
            {category.name}
          </Text>
          {category.type && (
            <Text style={styles.categoryType}>{category.type.name}</Text>
          )}
        </View>

        {/* Product Count Badge */}
        {category.productCount !== undefined && category.productCount > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{category.productCount}</Text>
          </View>
        )}

        {/* Arrow Icon */}
        <Ionicons
          name="chevron-forward"
          size={18}
          color={isSelected ? Colors.primary : Colors.textLight}
        />
      </TouchableOpacity>

      {/* Render Children */}
      {hasChildren && expanded && (
        <View style={styles.childrenContainer}>
          {category.children!.map((child) => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              level={level + 1}
              onPress={onPress}
              selectedId={selectedId}
            />
          ))}
        </View>
      )}
    </View>
  );
};

interface CategoryTreeProps {
  categories: Category[];
  onSelectCategory: (category: Category) => void;
  selectedId?: number;
}

export const CategoryTree: React.FC<CategoryTreeProps> = ({
  categories,
  onSelectCategory,
  selectedId,
}) => {
  return (
    <FlatList
      data={categories}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <CategoryTreeItem
          category={item}
          onPress={onSelectCategory}
          selectedId={selectedId}
        />
      )}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
  },
  listContainer: {
    paddingVertical: 8,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingRight: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemSelected: {
    backgroundColor: Colors.primary + '10',
  },
  expandButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  categoryImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
  },
  categoryNameSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  categoryNameRoot: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryType: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  countText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  childrenContainer: {
    backgroundColor: Colors.background,
  },
});
