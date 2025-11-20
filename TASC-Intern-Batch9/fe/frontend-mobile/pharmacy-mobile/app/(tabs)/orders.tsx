import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { formatPrice } from '@/utils/formatters';
import { styles } from './orders.styles';

type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';

interface OrderItem {
  id: number;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  date: string;
  items: OrderItem[];
  total: number;
  itemCount: number;
}

// Mock data
const MOCK_ORDERS: Order[] = [
  {
    id: 1,
    orderNumber: 'DH001234',
    status: 'shipping',
    date: '2024-11-15',
    itemCount: 2,
    total: 195000,
    items: [
      {
        id: 1,
        productName: 'Paracetamol 500mg Hộp 100 viên',
        productImage: 'https://via.placeholder.com/200',
        quantity: 2,
        price: 40000,
      },
      {
        id: 2,
        productName: 'Vitamin C 1000mg',
        productImage: 'https://via.placeholder.com/200',
        quantity: 1,
        price: 150000,
      },
    ],
  },
  {
    id: 2,
    orderNumber: 'DH001235',
    status: 'delivered',
    date: '2024-11-10',
    itemCount: 1,
    total: 350000,
    items: [
      {
        id: 3,
        productName: 'Omega 3 Fish Oil - Bổ sung DHA',
        productImage: 'https://via.placeholder.com/200',
        quantity: 1,
        price: 350000,
      },
    ],
  },
  {
    id: 3,
    orderNumber: 'DH001236',
    status: 'pending',
    date: '2024-11-18',
    itemCount: 3,
    total: 425000,
    items: [
      {
        id: 4,
        productName: 'Paracetamol 500mg',
        productImage: 'https://via.placeholder.com/200',
        quantity: 2,
        price: 40000,
      },
      {
        id: 5,
        productName: 'Vitamin B Complex',
        productImage: 'https://via.placeholder.com/200',
        quantity: 1,
        price: 185000,
      },
      {
        id: 6,
        productName: 'Calcium + D3',
        productImage: 'https://via.placeholder.com/200',
        quantity: 1,
        price: 200000,
      },
    ],
  },
];

const STATUS_CONFIG = {
  pending: {
    label: 'Chờ xác nhận',
    color: Colors.warning,
    bgColor: '#FFF3CD',
    icon: 'time-outline' as const,
  },
  confirmed: {
    label: 'Đã xác nhận',
    color: '#0066CC',
    bgColor: '#E6F2FF',
    icon: 'checkmark-circle-outline' as const,
  },
  shipping: {
    label: 'Đang giao',
    color: '#0066CC',
    bgColor: '#E6F2FF',
    icon: 'car-outline' as const,
  },
  delivered: {
    label: 'Đã giao',
    color: Colors.success,
    bgColor: '#D4EDDA',
    icon: 'checkmark-done-circle-outline' as const,
  },
  cancelled: {
    label: 'Đã hủy',
    color: Colors.error,
    bgColor: '#F8D7DA',
    icon: 'close-circle-outline' as const,
  },
};

export default function OrdersScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'all' | OrderStatus>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [orders] = useState<Order[]>(MOCK_ORDERS);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch orders from API
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const filteredOrders = selectedTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedTab);

  const handleOrderPress = (order: Order) => {
    console.log('Order pressed:', order.orderNumber);
    // TODO: Navigate to order detail screen
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const statusConfig = STATUS_CONFIG[item.status];

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => handleOrderPress(item)}
        activeOpacity={0.7}
      >
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderHeaderLeft}>
            <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
            <Text style={styles.orderDate}>{item.date}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
            <Ionicons name={statusConfig.icon} size={16} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Order Items Preview */}
        <View style={styles.itemsContainer}>
          {item.items.slice(0, 2).map((product, index) => (
            <View key={product.id} style={styles.itemRow}>
              <Image
                source={{ uri: product.productImage }}
                style={styles.itemImage}
                resizeMode="contain"
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {product.productName}
                </Text>
                <Text style={styles.itemQuantity}>x{product.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>{formatPrice(product.price)}</Text>
            </View>
          ))}
          {item.items.length > 2 && (
            <Text style={styles.moreItems}>
              +{item.items.length - 2} sản phẩm khác
            </Text>
          )}
        </View>

        {/* Order Footer */}
        <View style={styles.orderFooter}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
            <Text style={styles.totalValue}>{formatPrice(item.total)}</Text>
          </View>
          <TouchableOpacity style={styles.detailButton}>
            <Text style={styles.detailButtonText}>Xem chi tiết</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Action Buttons Based on Status */}
        {item.status === 'delivered' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.reviewButton}>
              <Text style={styles.reviewButtonText}>Đánh giá</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reorderButton}>
              <Text style={styles.reorderButtonText}>Mua lại</Text>
            </TouchableOpacity>
          </View>
        )}
        {item.status === 'shipping' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.trackButton}>
              <Ionicons name="location-outline" size={16} color={Colors.surface} />
              <Text style={styles.trackButtonText}>Theo dõi đơn hàng</Text>
            </TouchableOpacity>
          </View>
        )}
        {item.status === 'pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Hủy đơn</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={80} color={Colors.textLight} />
      <Text style={styles.emptyTitle}>Chưa có đơn hàng</Text>
      <Text style={styles.emptyText}>
        Bạn chưa có đơn hàng nào. Hãy mua sắm ngay!
      </Text>
      <TouchableOpacity 
        style={styles.shopButton}
        onPress={() => router.push('/(tabs)')}
      >
        <Text style={styles.shopButtonText}>Mua sắm ngay</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
      </View>

      {/* Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'all' && styles.tabActive]}
          onPress={() => setSelectedTab('all')}
        >
          <Text style={[styles.tabText, selectedTab === 'all' && styles.tabTextActive]}>
            Tất cả
          </Text>
          {selectedTab === 'all' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'pending' && styles.tabActive]}
          onPress={() => setSelectedTab('pending')}
        >
          <Text style={[styles.tabText, selectedTab === 'pending' && styles.tabTextActive]}>
            Chờ xác nhận
          </Text>
          {selectedTab === 'pending' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'confirmed' && styles.tabActive]}
          onPress={() => setSelectedTab('confirmed')}
        >
          <Text style={[styles.tabText, selectedTab === 'confirmed' && styles.tabTextActive]}>
            Đã xác nhận
          </Text>
          {selectedTab === 'confirmed' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'shipping' && styles.tabActive]}
          onPress={() => setSelectedTab('shipping')}
        >
          <Text style={[styles.tabText, selectedTab === 'shipping' && styles.tabTextActive]}>
            Đang giao
          </Text>
          {selectedTab === 'shipping' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'delivered' && styles.tabActive]}
          onPress={() => setSelectedTab('delivered')}
        >
          <Text style={[styles.tabText, selectedTab === 'delivered' && styles.tabTextActive]}>
            Đã giao
          </Text>
          {selectedTab === 'delivered' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'cancelled' && styles.tabActive]}
          onPress={() => setSelectedTab('cancelled')}
        >
          <Text style={[styles.tabText, selectedTab === 'cancelled' && styles.tabTextActive]}>
            Đã hủy
          </Text>
          {selectedTab === 'cancelled' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </ScrollView>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.ordersList}
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
      )}
    </View>
  );
}
