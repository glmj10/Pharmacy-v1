import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartItem as CartItemType } from '@/types';
import { formatPrice } from '@/utils/formatters';
import { Colors } from '@/constants/Colors';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
}) => {
  const handleDecrease = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (item.quantity < item.product.stockQuantity) {
      onUpdateQuantity(item.id, item.quantity + 1);
    }
  };

  const totalPrice = (item.product.discountPrice || item.product.price) * item.quantity;

  return (
    <View style={styles.container}>
      {/* Product Image */}
      <Image
        source={{
          uri: item.product.images?.[0] || 'https://via.placeholder.com/80',
        }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Product Info */}
      <View style={styles.infoContainer}>
        <View style={styles.topRow}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.product.title}
          </Text>
          <TouchableOpacity
            onPress={() => onRemove(item.id)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>

        {item.product.brand && (
          <Text style={styles.brandName}>{item.product.brand.name}</Text>
        )}

        <View style={styles.bottomRow}>
          {/* Price */}
          <View>
            <Text style={styles.price}>{formatPrice(totalPrice)}</Text>
            {item.product.discountPrice && (
              <Text style={styles.originalPrice}>
                {formatPrice(item.product.price * item.quantity)}
              </Text>
            )}
          </View>

          {/* Quantity Controls */}
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={[
                styles.quantityButton,
                item.quantity === 1 && styles.quantityButtonDisabled,
              ]}
              onPress={handleDecrease}
              disabled={item.quantity === 1}
            >
              <Ionicons
                name="remove"
                size={16}
                color={item.quantity === 1 ? Colors.disabled : Colors.text}
              />
            </TouchableOpacity>
            
            <Text style={styles.quantity}>{item.quantity}</Text>
            
            <TouchableOpacity
              style={[
                styles.quantityButton,
                item.quantity >= item.product.stockQuantity &&
                  styles.quantityButtonDisabled,
              ]}
              onPress={handleIncrease}
              disabled={item.quantity >= item.product.stockQuantity}
            >
              <Ionicons
                name="add"
                size={16}
                color={
                  item.quantity >= item.product.stockQuantity
                    ? Colors.disabled
                    : Colors.text
                }
              />
            </TouchableOpacity>
          </View>
        </View>

        {item.quantity >= item.product.stockQuantity && (
          <Text style={styles.stockWarning}>Đã đạt số lượng tối đa</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  productName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 18,
    marginRight: 8,
  },
  deleteButton: {
    padding: 2,
  },
  brandName: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  originalPrice: {
    fontSize: 12,
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    overflow: 'hidden',
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantity: {
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  stockWarning: {
    fontSize: 11,
    color: Colors.warning,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
