import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
  Modal,
} from 'react-native';
import RenderHtml from 'react-native-render-html';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Product } from '@/types';
import { formatPrice, calculateDiscount } from '@/utils/formatters';
import { productService } from '@/services/productService';
import { styles } from './ProductDetailScreen.styles';

const { width } = Dimensions.get('window');

// Mock product data
const MOCK_PRODUCT: Product = {
  id: 1,
  slug: 'paracetamol-500mg',
  title: 'Paracetamol 500mg Hộp 100 viên',
  description:
    'Thuốc giảm đau, hạ sốt hiệu quả. Paracetamol là một loại thuốc giảm đau và hạ sốt phổ biến, được sử dụng rộng rãi để điều trị các triệu chứng nhẹ đến trung bình.',
  price: 25000,
  discountPrice: 20000,
  images: [
    'https://via.placeholder.com/400',
    'https://via.placeholder.com/400/FF0000',
    'https://via.placeholder.com/400/00FF00',
  ],
  category: { id: 1, name: 'Thuốc không kê đơn', slug: 'khong-ke-don' },
  brand: { id: 1, name: 'Traphaco', slug: 'traphaco' },
  stockQuantity: 100,
  rating: 4.5,
  reviewCount: 128,
  ingredient: 'Paracetamol 500mg',
  dosage: 'Uống 1-2 viên mỗi lần, mỗi ngày 3-4 lần. Không quá 8 viên trong 24 giờ.',
  usage:
    'Dùng cho người lớn và trẻ em trên 12 tuổi. Uống sau bữa ăn. Không nên sử dụng quá 7 ngày liên tục.',
  sideEffects:
    'Có thể gây buồn nôn, nôn, phát ban da. Hiếm gặp: Phản ứng dị ứng, tổn thương gan.',
  prescriptionRequired: false,
};

const REVIEWS = [
  {
    id: 1,
    userName: 'Nguyễn Văn A',
    rating: 5,
    comment: 'Sản phẩm rất tốt, giảm đau nhanh chóng!',
    date: '2024-01-15',
  },
  {
    id: 2,
    userName: 'Trần Thị B',
    rating: 4,
    comment: 'Hiệu quả, giá hợp lý',
    date: '2024-01-10',
  },
];

export default function ProductDetailScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { width: windowWidth } = useWindowDimensions();
  
  const [product, setProduct] = useState<Product | null>(MOCK_PRODUCT);
  const [loading, setLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'reviews'>('info');
  const [refreshing, setRefreshing] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    if (slug) {
      loadProduct();
    }
  }, [slug]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      console.log('Loading product with slug:', slug);
      const response = await productService.getProductBySlug(slug as string);
      console.log('Product loaded:', response);
      
      // Xử lý response structure
      const productData = response?.data?.data || response?.data || response;
      setProduct(productData);
      setIsInWishlist(productData.inWishlist || false);
    } catch (error) {
      console.error('Error loading product:', error);
      // Giữ lại mock data nếu lỗi
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProduct();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.error} />
        <Text style={styles.errorText}>Không tìm thấy sản phẩm</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }
  const discount = product.priceNew && product.priceOld
    ? calculateDiscount(product.priceOld, product.priceNew)
    : 0;

  const handleAddToCart = () => {
    console.log('Add to cart:', quantity);
    // TODO: Add to cart
  };

  const handleBuyNow = () => {
    console.log('Buy now:', quantity);
    // TODO: Navigate to checkout
  };

  const handleToggleWishlist = () => {
    setIsInWishlist(!isInWishlist);
    // TODO: Update wishlist
  };

  // Strip HTML tags for preview
  const getPreviewText = (html: string, maxLength: number = 200) => {
    const text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const renderImageItem = ({ item, index }: { item: any; index: number }) => {
    const imageUrl = typeof item === 'string' ? item : item.imageUrl;
    return (
      <TouchableOpacity
        style={[
          styles.thumbnailContainer,
          selectedImageIndex === index && styles.thumbnailSelected,
        ]}
        onPress={() => setSelectedImageIndex(index)}
      >
        <Image source={{ uri: imageUrl }} style={styles.thumbnail} />
      </TouchableOpacity>
    );
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={16}
          color={Colors.warning}
        />
      );
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.push('/screens/cart')}
          >
            <Ionicons name="cart-outline" size={24} color={Colors.text} />
            {cartItemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="share-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Main Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ 
              uri: product.images?.[selectedImageIndex] 
                ? (typeof product.images[selectedImageIndex] === 'string' 
                    ? product.images[selectedImageIndex] 
                    : (product.images[selectedImageIndex] as any).imageUrl)
                : product.thumbnailUrl || 'https://via.placeholder.com/400'
            }}
            style={styles.mainImage}
            resizeMode="contain"
          />
          
          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discount}%</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={handleToggleWishlist}
          >
            <Ionicons
              name={isInWishlist ? 'heart' : 'heart-outline'}
              size={24}
              color={isInWishlist ? Colors.error : Colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Image Thumbnails */}
        <FlatList
          data={product.images}
          renderItem={renderImageItem}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailList}
        />

        {/* Product Info */}
        <View style={styles.infoSection}>
          {product.brand && (
            <View style={styles.brandBadge}>
              <Text style={styles.brandText}>{product.brand.name}</Text>
            </View>
          )}
          
          <Text style={styles.productTitle}>{product.title}</Text>
          
          <View style={styles.ratingRow}>
            <View style={styles.ratingStars}>{renderStars(Math.round(product.rating || 0))}</View>
            <Text style={styles.ratingText}>
              {product.rating?.toFixed(1)} ({product.reviewCount} đánh giá)
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.currentPrice}>
              {formatPrice(product.priceNew || product.priceOld || 0)}
            </Text>
            {product.priceNew && product.priceOld && product.priceNew < product.priceOld && (
              <Text style={styles.originalPrice}>{formatPrice(product.priceOld)}</Text>
            )}
          </View>

          <View style={styles.stockRow}>
            <Ionicons name="cube-outline" size={18} color={Colors.success} />
            <Text style={styles.stockText}>Còn hàng: {product.quantity || product.stockQuantity || 0} sản phẩm</Text>
          </View>
        </View>

        {/* Quantity Selector */}
        <View style={styles.quantitySection}>
          <Text style={styles.quantityLabel}>Số lượng:</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={[styles.quantityButton, quantity === 1 && styles.quantityButtonDisabled]}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity === 1}
            >
              <Ionicons
                name="remove"
                size={20}
                color={quantity === 1 ? Colors.disabled : Colors.text}
              />
            </TouchableOpacity>
            
            <Text style={styles.quantityValue}>{quantity}</Text>
            
            <TouchableOpacity
              style={[
                styles.quantityButton,
                quantity >= (product.quantity ?? product.stockQuantity ?? 0) && styles.quantityButtonDisabled,
              ]}
              onPress={() => setQuantity(Math.min(product.quantity ?? product.stockQuantity ?? 0, quantity + 1))}
              disabled={quantity >= (product.quantity ?? product.stockQuantity ?? 0)}
            >
              <Ionicons
                name="add"
                size={20}
                color={quantity >= (product.quantity ?? product.stockQuantity ?? 0) ? Colors.disabled : Colors.text}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'info' && styles.tabActive]}
            onPress={() => setActiveTab('info')}
          >
            <Text style={[styles.tabText, activeTab === 'info' && styles.tabTextActive]}>
              Thông tin
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reviews' && styles.tabActive]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text style={[styles.tabText, activeTab === 'reviews' && styles.tabTextActive]}>
              Đánh giá ({product.reviewCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'info' ? (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
            {product.description && (
              <>
                <Text style={styles.descriptionPreview}>
                  {getPreviewText(product.description, 150)}
                </Text>
                <TouchableOpacity 
                  style={styles.viewMoreButton}
                  onPress={() => setShowFullDescription(true)}
                >
                  <Text style={styles.viewMoreText}>Xem chi tiết</Text>
                  <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
                </TouchableOpacity>
              </>
            )}

            {product.ingredient && (
              <>
                <Text style={styles.sectionTitle}>Thành phần</Text>
                <Text style={styles.sectionText}>{product.ingredient}</Text>
              </>
            )}

            {product.dosage && (
              <>
                <Text style={styles.sectionTitle}>Liều lượng</Text>
                <Text style={styles.sectionText}>{product.dosage}</Text>
              </>
            )}

            {product.usage && (
              <>
                <Text style={styles.sectionTitle}>Cách sử dụng</Text>
                <Text style={styles.sectionText}>{product.usage}</Text>
              </>
            )}

            {product.sideEffects && (
              <>
                <Text style={styles.sectionTitle}>Tác dụng phụ</Text>
                <Text style={styles.sectionText}>{product.sideEffects}</Text>
              </>
            )}
          </View>
        ) : (
          <View style={styles.contentSection}>
            {REVIEWS.map((review) => (
              <View key={review.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <View>
                    <Text style={styles.reviewUserName}>{review.userName}</Text>
                    <View style={styles.reviewStars}>{renderStars(review.rating)}</View>
                  </View>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Ionicons name="cart-outline" size={20} color={Colors.primary} />
          <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyNowButton} onPress={handleBuyNow}>
          <Text style={styles.buyNowText}>Mua ngay</Text>
        </TouchableOpacity>
      </View>

      {/* Full Description Modal */}
      <Modal
        visible={showFullDescription}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowFullDescription(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Mô tả sản phẩm</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowFullDescription(false)}
            >
              <Ionicons name="close" size={28} color={Colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView 
            style={styles.modalContent}
            showsVerticalScrollIndicator={true}
          >
            {product?.description && (
              <RenderHtml
                contentWidth={windowWidth - 32}
                source={{ html: product.description }}
                tagsStyles={{
                  body: {
                    fontSize: 14,
                    lineHeight: 22,
                    color: Colors.textSecondary,
                  },
                  p: {
                    marginBottom: 12,
                  },
                  h1: {
                    fontSize: 20,
                    fontWeight: '600',
                    color: Colors.text,
                    marginTop: 12,
                    marginBottom: 8,
                  },
                  h2: {
                    fontSize: 18,
                    fontWeight: '600',
                    color: Colors.text,
                    marginTop: 12,
                    marginBottom: 8,
                  },
                  h3: {
                    fontSize: 16,
                    fontWeight: '600',
                    color: Colors.text,
                    marginTop: 12,
                    marginBottom: 8,
                  },
                  a: {
                    color: Colors.primary,
                  },
                  ul: {
                    marginBottom: 12,
                  },
                  ol: {
                    marginBottom: 12,
                  },
                  li: {
                    marginBottom: 4,
                  },
                }}
              />
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
