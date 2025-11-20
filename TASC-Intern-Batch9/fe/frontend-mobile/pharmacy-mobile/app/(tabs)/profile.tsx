import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { styles } from './profile.styles';

const MENU_ITEMS = [
  {
    id: 'orders',
    title: 'Đơn hàng của tôi',
    icon: 'receipt-outline',
    color: Colors.primary,
  },
  {
    id: 'addresses',
    title: 'Địa chỉ giao hàng',
    icon: 'location-outline',
    color: Colors.info,
  },
  {
    id: 'wishlist',
    title: 'Sản phẩm yêu thích',
    icon: 'heart-outline',
    color: Colors.error,
  },
  {
    id: 'reviews',
    title: 'Đánh giá của tôi',
    icon: 'star-outline',
    color: Colors.warning,
  },
  {
    id: 'prescriptions',
    title: 'Đơn thuốc của tôi',
    icon: 'document-text-outline',
    color: Colors.accent,
  },
  {
    id: 'notifications',
    title: 'Thông báo',
    icon: 'notifications-outline',
    color: Colors.secondary,
  },
  {
    id: 'settings',
    title: 'Cài đặt',
    icon: 'settings-outline',
    color: Colors.textSecondary,
  },
  {
    id: 'help',
    title: 'Trợ giúp & Hỗ trợ',
    icon: 'help-circle-outline',
    color: Colors.info,
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false); // Changed to false to show login button by default
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch user profile data from API
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleMenuPress = (id: string) => {
    console.log('Menu pressed:', id);
    
    // If not logged in and not settings menu, redirect to login
    if (!isLoggedIn && id !== 'settings' && id !== 'help') {
      router.push('/screens/LoginScreen');
      return;
    }
    
    // TODO: Navigate to respective screen based on id
    switch (id) {
      case 'settings':
        console.log('Navigate to settings');
        // router.push('/screens/SettingsScreen');
        break;
      case 'help':
        console.log('Navigate to help');
        // router.push('/screens/HelpScreen');
        break;
      case 'orders':
        console.log('Navigate to orders');
        // router.push('/screens/OrdersScreen');
        break;
      case 'addresses':
        console.log('Navigate to addresses');
        // router.push('/screens/AddressesScreen');
        break;
      case 'wishlist':
        console.log('Navigate to wishlist');
        // router.push('/screens/WishlistScreen');
        break;
      case 'reviews':
        console.log('Navigate to reviews');
        // router.push('/screens/ReviewsScreen');
        break;
      case 'prescriptions':
        console.log('Navigate to prescriptions');
        // router.push('/screens/PrescriptionsScreen');
        break;
      case 'notifications':
        console.log('Navigate to notifications');
        // router.push('/screens/NotificationsScreen');
        break;
      default:
        break;
    }
  };

  const handleLogin = () => {
    console.log('Navigate to login');
    router.push('/screens/LoginScreen');
  };

  const handleLogout = () => {
    console.log('Logout');
    // TODO: Handle logout
    setIsLoggedIn(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tài khoản</Text>
        <TouchableOpacity onPress={() => handleMenuPress('settings')}>
          <Ionicons name="settings-outline" size={24} color={Colors.text} />
        </TouchableOpacity>
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
        {!isLoggedIn ? (
          /* Login Prompt Card */
          <View style={styles.loginPromptCard}>
            <Ionicons name="person-circle-outline" size={80} color={Colors.primary} style={styles.loginPromptIcon} />
            <Text style={styles.loginPromptTitle}>Đăng nhập để trải nghiệm đầy đủ</Text>
            <Text style={styles.loginPromptText}>
              Quản lý đơn hàng, theo dõi giao hàng và nhiều tính năng khác
            </Text>
            <View style={styles.loginPromptButtons}>
              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Đăng nhập</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.registerButton} 
                onPress={() => router.push('/screens/RegisterScreen')}
              >
                <Text style={styles.registerButtonText}>Đăng ký</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Profile Card */
          <>
            <View style={styles.profileCard}>
              <Image
                source={{ uri: 'https://via.placeholder.com/80' }}
                style={styles.avatar}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>Nguyễn Văn A</Text>
                <Text style={styles.profileEmail}>nguyenvana@email.com</Text>
                <Text style={styles.profilePhone}>0123 456 789</Text>
              </View>
              <TouchableOpacity style={styles.editButton}>
                <Ionicons name="create-outline" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>Đơn hàng</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>8</Text>
                <Text style={styles.statLabel}>Yêu thích</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>25</Text>
                <Text style={styles.statLabel}>Đánh giá</Text>
              </View>
            </View>
          </>
        )}

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index === MENU_ITEMS.length - 1 && styles.menuItemLast,
              ]}
              onPress={() => handleMenuPress(item.id)}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon as any} size={22} color={item.color} />
                </View>
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button - Only show when logged in */}
        {isLoggedIn && (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color={Colors.error} />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        )}

        {/* App Version */}
        <Text style={styles.versionText}>Phiên bản 1.0.0</Text>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}
