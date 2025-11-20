import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { Category } from '@/types';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 64) / 3;

interface CategoryCardProps {
  category: Category;
  onPress: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Image
          source={{
            uri: category.image || 'https://via.placeholder.com/80',
          }}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    width: 40,
    height: 40,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 16,
  },
});
