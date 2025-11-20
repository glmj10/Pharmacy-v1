import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '@/types';
import { formatPrice, calculateDiscount } from '@/utils/formatters';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onAddToCart?: () => void;
  onToggleWishlist?: () => void;
  isInWishlist?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onAddToCart,
  onToggleWishlist,
  isInWishlist = false,
}) => {
  const discount = product.priceNew && product.priceOld
    ? calculateDiscount(product.priceOld, product.priceNew)
    : 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Image Container */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: product.thumbnailUrl || 'https://via.placeholder.com/200',
          }}
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Discount Badge */}
        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discount}%</Text>
          </View>
        )}

        {/* Wishlist Button */}
        {onToggleWishlist && (
          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={onToggleWishlist}
          >
            <Ionicons
              name={product.inWishlist || isInWishlist ? 'heart' : 'heart-outline'}
              size={20}
              color={product.inWishlist || isInWishlist ? Colors.error : Colors.text}
            />
          </TouchableOpacity>
        )}

        {/* Stock Badge */}
        {(product.quantity === 0 || product.stockQuantity === 0) && (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>Hết hàng</Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.title}
        </Text>

        {/* Brand */}
        {product.brand && (
          <Text style={styles.brandName}>{product.brand.name}</Text>
        )}

        {/* Rating */}
        {product.rating && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={Colors.warning} />
            <Text style={styles.ratingText}>
              {product.rating.toFixed(1)} ({product.reviewCount || 0})
            </Text>
          </View>
        )}

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>
            {formatPrice(product.priceNew || product.priceOld || 0)}
          </Text>
          {product.priceNew && product.priceOld && product.priceNew < product.priceOld && (
            <Text style={styles.originalPrice}>{formatPrice(product.priceOld)}</Text>
          )}
        </View>

        {/* Add to Cart Button */}
        {onAddToCart && (product.quantity ?? product.stockQuantity ?? 0) > 0 && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={onAddToCart}
            activeOpacity={0.7}
          >
            <Ionicons name="cart-outline" size={18} color={Colors.primary} />
            <Text style={styles.addButtonText}>Thêm</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: Colors.surface,
    fontSize: 11,
    fontWeight: 'bold',
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.surface,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  outOfStockBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 6,
    alignItems: 'center',
  },
  outOfStockText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  infoContainer: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
    lineHeight: 18,
  },
  brandName: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginRight: 6,
  },
  originalPrice: {
    fontSize: 12,
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight + '20',
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 4,
  },
});
