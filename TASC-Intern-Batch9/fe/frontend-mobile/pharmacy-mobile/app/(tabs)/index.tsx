import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SearchBar } from '@/components/SearchBar';
import { CategoryCard } from '@/components/CategoryCard';
import { ProductCard } from '@/components/ProductCard';
import { Colors } from '@/constants/Colors';
import { Product, Category } from '@/types';
import { styles } from './index.styles';

// Mock data - Thay bằng API call thực tế
const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: 'Thuốc kê đơn', slug: 'ke-don', image: 'https://via.placeholder.com/80' },
  { id: 2, name: 'Thuốc không kê đơn', slug: 'khong-ke-don', image: 'https://via.placeholder.com/80' },
  { id: 3, name: 'Vitamin & Thực phẩm chức năng', slug: 'vitamin', image: 'https://via.placeholder.com/80' },
  { id: 4, name: 'Chăm sóc cá nhân', slug: 'cham-soc', image: 'https://via.placeholder.com/80' },
  { id: 5, name: 'Thiết bị y tế', slug: 'thiet-bi', image: 'https://via.placeholder.com/80' },
  { id: 6, name: 'Mẹ & Bé', slug: 'me-be', image: 'https://via.placeholder.com/80' },
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    slug: 'paracetamol-500mg',
    title: 'Paracetamol 500mg',
    description: 'Thuốc giảm đau, hạ sốt',
    price: 25000,
    discountPrice: 20000,
    images: ['https://via.placeholder.com/200'],
    category: MOCK_CATEGORIES[1],
    brand: { id: 1, name: 'Traphaco', slug: 'traphaco' },
    stockQuantity: 100,
    rating: 4.5,
    reviewCount: 128,
  },
  {
    id: 2,
    slug: 'vitamin-c-1000mg',
    title: 'Vitamin C 1000mg',
    description: 'Tăng cường sức đề kháng',
    price: 150000,
    images: ['https://via.placeholder.com/200'],
    category: MOCK_CATEGORIES[2],
    brand: { id: 2, name: 'DHG Pharma', slug: 'dhg' },
    stockQuantity: 50,
    rating: 4.8,
    reviewCount: 256,
  },
];

const BANNER_DATA = [
  { id: 1, image: 'https://via.placeholder.com/400x180/00A86B/FFFFFF?text=Sale+20%25' },
  { id: 2, image: 'https://via.placeholder.com/400x180/4ECDC4/FFFFFF?text=Miễn+phí+vận+chuyển' },
  { id: 3, image: 'https://via.placeholder.com/400x180/FF6B6B/FFFFFF?text=Khuyến+mãi+hot' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch data from API
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
    // TODO: Navigate to search results
  };

  const handleCategoryPress = (category: Category) => {
    console.log('Category pressed:', category.name);
    // TODO: Navigate to category products
  };

  const handleProductPress = (product: Product) => {
    console.log('Product pressed:', product.title, 'slug:', product.slug);
    router.push(`/screens/ProductDetailScreen?slug=${product.slug}`);
  };

  const handleAddToCart = (product: Product) => {
    console.log('Add to cart:', product.title);
    // TODO: Add to cart
  };

  const renderBanner = ({ item }: { item: { id: number; image: string } }) => (
    <Image source={{ uri: item.image }} style={styles.bannerImage} resizeMode="cover" />
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Xin chào 👋</Text>
            <Text style={styles.headerTitle}>Nhà thuốc Pharmacy</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={Colors.text} />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSearch={handleSearch}
          style={styles.searchBar}
        />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Banner Slider */}
        <FlatList
          data={BANNER_DATA}
          renderItem={renderBanner}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.bannerContainer}
        />

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.primary + '20' }]}>
              <Ionicons name="receipt-outline" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.actionText}>Đơn hàng</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.info + '20' }]}>
              <Ionicons name="location-outline" size={24} color={Colors.info} />
            </View>
            <Text style={styles.actionText}>Tìm nhà thuốc</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.warning + '20' }]}>
              <Ionicons name="call-outline" size={24} color={Colors.warning} />
            </View>
            <Text style={styles.actionText}>Tư vấn</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.secondary + '20' }]}>
              <Ionicons name="gift-outline" size={24} color={Colors.secondary} />
            </View>
            <Text style={styles.actionText}>Ưu đãi</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Danh mục</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={categories}
            renderItem={({ item }) => (
              <CategoryCard
                category={item}
                onPress={() => handleCategoryPress(item)}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          />
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sản phẩm nổi bật</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.productGrid}>
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPress={() => handleProductPress(product)}
                onAddToCart={() => handleAddToCart(product)}
              />
            ))}
          </View>
        </View>

        {/* Health Tips Banner */}
        <TouchableOpacity style={styles.healthTipBanner}>
          <View style={styles.healthTipIcon}>
            <Ionicons name="medical" size={32} color={Colors.primary} />
          </View>
          <View style={styles.healthTipContent}>
            <Text style={styles.healthTipTitle}>Mẹo sức khỏe</Text>
            <Text style={styles.healthTipText}>
              Xem các bài viết về chăm sóc sức khỏe
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}
