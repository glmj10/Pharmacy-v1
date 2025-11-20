import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SearchBar } from '@/components/SearchBar';
import { ProductCard } from '@/components/ProductCard';
import { CategoryModal } from '@/components/CategoryModal';
import { Colors } from '@/constants/Colors';
import { Product, Category, Brand } from '@/types';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { brandService } from '@/services/brandService';
import { styles } from './ProductsScreen.styles';

// Mock data
const MOCK_PRODUCTS: Product[] = [
  {
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
  {
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
  {
    id: 3,
    slug: 'omega-3-fish-oil',
    title: 'Omega 3 Fish Oil 1000mg',
    description: 'Hỗ trợ tim mạch, não bộ',
    price: 280000,
    discountPrice: 250000,
    images: ['https://via.placeholder.com/200'],
    category: { id: 2, name: 'Vitamin', slug: 'vitamin' },
    brand: { id: 3, name: 'Nature Made', slug: 'nature-made' },
    stockQuantity: 30,
    rating: 4.7,
    reviewCount: 89,
  },
  {
    id: 4,
    slug: 'multivitamin-daily',
    title: 'Multivitamin Daily - Vitamin tổng hợp',
    description: 'Vitamin tổng hợp hàng ngày',
    price: 320000,
    images: ['https://via.placeholder.com/200'],
    category: { id: 2, name: 'Vitamin', slug: 'vitamin' },
    brand: { id: 3, name: 'Nature Made', slug: 'nature-made' },
    stockQuantity: 25,
    rating: 4.6,
    reviewCount: 145,
  },
];



const SORT_OPTIONS = [
  { id: 'default', label: 'Mặc định' },
  { id: 'price-asc', label: 'Giá thấp đến cao' },
  { id: 'price-desc', label: 'Giá cao đến thấp' },
  { id: 'name-asc', label: 'Tên A-Z' },
  { id: 'rating', label: 'Đánh giá cao nhất' },
];

export default function ProductsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [brandModalVisible, setBrandModalVisible] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const [selectedBrand, setSelectedBrand] = useState<number>(0);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [selectedSort, setSelectedSort] = useState('default');
  
  // Wishlist
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load products when filters change
  useEffect(() => {
    setCurrentPage(1);
    loadProducts(1, false);
  }, [selectedCategory, selectedBrand, selectedSort, searchQuery]);

  const loadInitialData = async () => {
    try {
      console.log('Loading categories and brands...');
      console.log('API URL: http://192.168.31.49:8080/api/v1');
      
      const [categoriesData, brandsData] = await Promise.all([
        categoryService.getAllCategories(),
        brandService.getAllBrands(),
      ]);
      
      console.log('Categories loaded:', categoriesData?.length || 0);
      console.log('Brands loaded:', brandsData?.length || 0);
      
      // Thêm option "Tất cả" vào đầu danh sách
      setCategories([{ id: 0, name: 'Tất cả', slug: 'all' }, ...categoriesData]);
      setBrands([{ id: 0, name: 'Tất cả', slug: 'all' }, ...brandsData]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      console.error('Make sure backend is running on http://192.168.31.49:8080');
      console.error('And phone is on the same WiFi network');
    }
  };

  const loadProducts = async (page = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      console.log('Loading products page', page, 'with filters:', {
        category: selectedCategory,
        brand: selectedBrand,
        search: searchQuery,
        sort: selectedSort,
      });

      const params: any = {
        pageIndex: page,
        pageSize: 10,
      };

      if (searchQuery) params.title = searchQuery;
      if (selectedCategory && selectedCategory.id > 0) {
        params.category = selectedCategory.slug;
      }
      if (selectedBrand > 0) {
        const brand = brands.find(b => b.id === selectedBrand);
        if (brand) params.brand = brand.slug;
      }

      // Handle sorting
      if (selectedSort === 'price-asc') {
        params.isAscending = true;
      } else if (selectedSort === 'price-desc') {
        params.isAscending = false;
      }

      const response = await productService.getAllProducts(params);
      console.log('Products response page', page, ':', response);
      console.log('Products loaded:', response.content?.length || 0, 'items');
      
      if (append) {
        setProducts(prev => [...prev, ...(response.content || [])]);
      } else {
        setProducts(response.content || []);
      }
      
      setCurrentPage(page);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Error loading products:', error);
      if (!append) {
        setProducts(MOCK_PRODUCTS); // Fallback to mock data
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
    loadProducts();
  };

  const handleProductPress = (product: Product) => {
    console.log('Product pressed:', product.title, 'slug:', product.slug);
    router.push(`/screens/ProductDetailScreen?slug=${product.slug}`);
  };

  const handleAddToCart = (product: Product) => {
    console.log('Add to cart:', product.title);
    // TODO: Add to cart
  };

  const handleToggleWishlist = (product: Product) => {
    setWishlistIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(product.id)) {
        newSet.delete(product.id);
        console.log('Removed from wishlist:', product.title);
      } else {
        newSet.add(product.id);
        console.log('Added to wishlist:', product.title);
      }
      return newSet;
    });
  };

  const applyFilters = () => {
    setFilterModalVisible(false);
    loadProducts();
  };

  const resetFilters = () => {
    // setSelectedCategory(0);
    setSelectedBrand(0);
    setPriceRange([0, 1000000]);
  };

  const applySort = (sortId: string) => {
    setSelectedSort(sortId);
    setSortModalVisible(false);
    loadProducts();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    await Promise.all([loadInitialData(), loadProducts(1, false)]);
    setRefreshing(false);
  };

  const loadMoreProducts = () => {
    if (!loadingMore && currentPage < totalPages) {
      console.log('Loading more products, page:', currentPage + 1);
      loadProducts(currentPage + 1, true);
    }
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={() => handleProductPress(item)}
      onAddToCart={() => handleAddToCart(item)}
      onToggleWishlist={() => handleToggleWishlist(item)}
      isInWishlist={wishlistIds.has(item.id)}
    />
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sản phẩm</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="heart-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="cart-outline" size={24} color={Colors.text} />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>2</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSearch={handleSearch}
          onFilterPress={() => setFilterModalVisible(true)}
        />
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterChips}
        contentContainerStyle={styles.filterChipsContent}
      >
        <TouchableOpacity
          style={styles.categoryChip}
          onPress={() => setCategoryModalVisible(true)}
        >
          <Ionicons name="grid-outline" size={16} color={Colors.primary} />
          <Text style={styles.categoryChipText}>
            {selectedCategory ? selectedCategory.name : 'Danh mục'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.categoryChip}
          onPress={() => setBrandModalVisible(true)}
        >
          <Ionicons name="pricetags-outline" size={16} color={Colors.primary} />
          <Text style={styles.categoryChipText}>
            {selectedBrand > 0 ? brands.find(b => b.id === selectedBrand)?.name : 'Thương hiệu'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sortChip}
          onPress={() => setSortModalVisible(true)}
        >
          <Ionicons name="swap-vertical" size={16} color={Colors.primary} />
          <Text style={styles.sortChipText}>Sắp xếp</Text>
        </TouchableOpacity>
        
        {selectedCategory && (
          <View style={styles.activeChip}>
            <Text style={styles.activeChipText}>{selectedCategory.name}</Text>
            <TouchableOpacity onPress={() => setSelectedCategory(undefined)}>
              <Ionicons name="close-circle" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        )}
        
        {selectedBrand > 0 && (
          <View style={styles.activeChip}>
            <Text style={styles.activeChipText}>
              {brands.find((b) => b.id === selectedBrand)?.name}
            </Text>
            <TouchableOpacity onPress={() => setSelectedBrand(0)}>
              <Ionicons name="close-circle" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        {(selectedCategory || selectedBrand > 0) && (
          <TouchableOpacity
            style={styles.resetChip}
            onPress={() => {
              setSelectedCategory(undefined);
              setSelectedBrand(0);
            }}
          >
            <Ionicons name="refresh" size={16} color={Colors.error} />
            <Text style={styles.resetChipText}>Đặt lại</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Products List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="medical-outline" size={80} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>Không tìm thấy sản phẩm</Text>
          <Text style={styles.emptySubtitle}>
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.productList}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMoreProducts}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.loadingMoreText}>Đang tải thêm...</Text>
              </View>
            ) : null
          }
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

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bộ lọc</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.filterLabel}>Các bộ lọc khác sẽ được thêm vào đây</Text>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetFilters}
              >
                <Text style={styles.resetButtonText}>Đặt lại</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={applyFilters}
              >
                <Text style={styles.applyButtonText}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Sort Modal */}
      <Modal
        visible={sortModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSortModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sắp xếp theo</Text>
              <TouchableOpacity onPress={() => setSortModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {SORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.filterOption}
                  onPress={() => applySort(option.id)}
                >
                  <Text style={styles.filterOptionText}>{option.label}</Text>
                  {selectedSort === option.id && (
                    <Ionicons name="checkmark" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Category Tree Modal */}
      <CategoryModal
        visible={categoryModalVisible}
        categories={categories}
        selectedCategory={selectedCategory}
        onClose={() => setCategoryModalVisible(false)}
        onSelectCategory={(category) => {
          setSelectedCategory(category);
          setCategoryModalVisible(false);
        }}
      />

      {/* Brand Modal */}
      <Modal
        visible={brandModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setBrandModalVisible(false)}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Thương hiệu</Text>
            <TouchableOpacity onPress={() => setBrandModalVisible(false)}>
              <Ionicons name="close" size={28} color={Colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            {brands.map((brand) => (
              <TouchableOpacity
                key={brand.id}
                style={styles.filterOption}
                onPress={() => {
                  setSelectedBrand(brand.id);
                  setBrandModalVisible(false);
                }}
              >
                <Text style={styles.filterOptionText}>{brand.name}</Text>
                {selectedBrand === brand.id && (
                  <Ionicons name="checkmark" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
