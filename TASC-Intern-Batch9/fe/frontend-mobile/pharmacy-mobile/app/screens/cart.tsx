import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CartItem as CartItemComponent } from '@/components/CartItem';
import { Colors } from '@/constants/Colors';
import { CartItem as CartItemType } from '@/types';
import { formatPrice } from '@/utils/formatters';

// Mock data
const MOCK_CART_ITEMS: CartItemType[] = [
  {
    id: 1,
    quantity: 2,
    product: {
      id: 1,
      slug: 'paracetamol-500mg',
      title: 'Paracetamol 500mg Hộp 100 viên',
      description: 'Thuốc giảm đau, hạ sốt',
      price: 25000,
      discountPrice: 20000,
      images: ['https://via.placeholder.com/200'],
      category: { id: 1, name: 'Thuốc không kê đơn', slug: 'khong-ke-don' },
      brand: { id: 1, name: 'Traphaco', slug: 'traphaco' },
      stockQuantity: 100,
      rating: 4.5,
      reviewCount: 128,
    },
    selected: true
  },
  {
    id: 2,
    quantity: 1,
    product: {
      id: 2,
      slug: 'vitamin-c-1000mg',
      title: 'Vitamin C 1000mg - Tăng sức đề kháng',
      description: 'Tăng cường sức đề kháng',
      price: 150000,
      images: ['https://via.placeholder.com/200'],
      category: { id: 2, name: 'Vitamin', slug: 'vitamin' },
      brand: { id: 2, name: 'DHG Pharma', slug: 'dhg' },
      stockQuantity: 50,
      rating: 4.8,
      reviewCount: 256,
    },
    selected: true
  },
];

export default function CartScreen() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItemType[]>(MOCK_CART_ITEMS);
  const [selectedItems, setSelectedItems] = useState<number[]>(
    MOCK_CART_ITEMS.map((item) => item.id)
  );
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch cart data from API
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleUpdateQuantity = (id: number, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handleRemoveItem = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item.id));
    }
  };

  const toggleSelectItem = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const calculateSubtotal = () => {
    return cartItems
      .filter((item) => selectedItems.includes(item.id))
      .reduce((total, item) => {
        const price = item.product.priceNew || item.product.priceOld || 0;
        return total + price * item.quantity;
      }, 0);
  };

  const calculateDiscount = () => {
    return cartItems
      .filter((item) => selectedItems.includes(item.id))
      .reduce((total, item) => {
        if (item.product.priceNew && item.product.priceOld && item.product.priceNew < item.product.priceOld) {
          return (
            total +
            (item.product.priceOld - item.product.priceNew) * item.quantity
          );
        }
        return total;
      }, 0);
  };

  const subtotal = calculateSubtotal();
  const discount = calculateDiscount();
  const shipping = subtotal > 0 ? 30000 : 0;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    console.log('Proceeding to checkout');
    // TODO: Navigate to checkout screen
  };

  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Giỏ hàng</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
          <Text style={styles.emptyText}>
            Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
          </Text>
          <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/(tabs)')}>
            <Text style={styles.shopButtonText}>Mua sắm ngay</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giỏ hàng ({cartItems.length})</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Text style={styles.deleteAllText}>Xóa tất cả</Text>
        </TouchableOpacity>
      </View>

      {/* Select All */}
      <TouchableOpacity style={styles.selectAllContainer} onPress={toggleSelectAll}>
        <Ionicons
          name={
            selectedItems.length === cartItems.length
              ? 'checkbox'
              : 'square-outline'
          }
          size={24}
          color={Colors.primary}
        />
        <Text style={styles.selectAllText}>Chọn tất cả</Text>
      </TouchableOpacity>

      {/* Cart Items */}
      <FlatList
        data={cartItems}
        renderItem={({ item }) => (
          <View style={styles.cartItemWrapper}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => toggleSelectItem(item.id)}
            >
              <Ionicons
                name={
                  selectedItems.includes(item.id)
                    ? 'checkbox'
                    : 'square-outline'
                }
                size={24}
                color={Colors.primary}
              />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <CartItemComponent
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
              />
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.cartList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      />

      {/* Voucher */}
      <TouchableOpacity style={styles.voucherContainer}>
        <View style={styles.voucherLeft}>
          <Ionicons name="pricetag" size={20} color={Colors.primary} />
          <Text style={styles.voucherText}>Mã giảm giá</Text>
        </View>
        <View style={styles.voucherRight}>
          <Text style={styles.voucherApply}>Chọn mã</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </View>
      </TouchableOpacity>

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tạm tính:</Text>
          <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
        </View>
        {discount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Giảm giá:</Text>
            <Text style={[styles.summaryValue, { color: Colors.success }]}>
              -{formatPrice(discount)}
            </Text>
          </View>
        )}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Phí vận chuyển:</Text>
          <Text style={styles.summaryValue}>
            {shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Tổng cộng:</Text>
          <Text style={styles.totalValue}>{formatPrice(total)}</Text>
        </View>
      </View>

      {/* Checkout Button */}
      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerLabel}>Tổng thanh toán</Text>
          <Text style={styles.footerTotal}>{formatPrice(total)}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.checkoutButton,
            selectedItems.length === 0 && styles.checkoutButtonDisabled,
          ]}
          onPress={handleCheckout}
          disabled={selectedItems.length === 0}
        >
          <Text style={styles.checkoutButtonText}>
            Thanh toán ({selectedItems.length})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: Colors.surface,
  },
  headerButton: {
    padding: 4,
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  deleteAllText: {
    fontSize: 14,
    color: Colors.error,
    fontWeight: '600',
  },
  selectAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    gap: 12,
  },
  selectAllText: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '600',
  },
  cartList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  cartItemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  checkbox: {
    padding: 4,
  },
  voucherContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  voucherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  voucherText: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '600',
  },
  voucherRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  voucherApply: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  summary: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 12,
  },
  footerInfo: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  footerTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 2,
  },
  checkoutButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginLeft: 12,
  },
  checkoutButtonDisabled: {
    backgroundColor: Colors.disabled,
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.surface,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  shopButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.surface,
  },
});
