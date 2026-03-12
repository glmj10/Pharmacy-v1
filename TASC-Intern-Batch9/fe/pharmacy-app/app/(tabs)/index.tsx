import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppSelector, useAppDispatch } from '../../src/store/hooks';
import { fetchProducts } from '../../src/store/productSlice';
import { ProductCard } from '../../src/components/ProductCard';

// Layout
import { AppHeader } from '../../src/components/layout/AppHeader';
import { AppFooter } from '../../src/components/layout/AppFooter'; 

// New Components
import { HeroSlider } from '../../src/components/home/HeroSlider';
import { PolicySection } from '../../src/components/home/PolicySection';
import { BlogCard } from '../../src/components/blog/BlogCard';

// Services & Types
import bannerService from '../../src/api/bannerService';
import blogService from '../../src/api/blogService';
import promotionService from '../../src/api/promotionService';
import PromotionCard from '../../src/components/promotion/PromotionCard';
import { Banner } from '../../src/types/banner';
import { Blog } from '../../src/types/blog';
import { Promotion, PromotionItemResponse } from '../../src/types/promotion';

export default function HomeScreen() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { items: products } = useAppSelector((state) => state.products);

    const [banners, setBanners] = useState<Banner[]>([]);
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [ongoingPromotions, setOngoingPromotions] = useState<Promotion[]>([]);
    const [promoItems, setPromoItems] = useState<PromotionItemResponse[]>([]);
    const [loading, setLoading] = useState(true);

      function mapBlogResponse(res: any): Blog {
        return {
          id: res.id,
          title: res.title,
          slug: res.slug,
          thumbnail: res.thumbnail,
          category: res.category,
          createdAt: res.createdAt,
          updatedAt: res.updatedAt,
          content: res.content
        };
      }

    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Fetch Products (Redux)
                dispatch(fetchProducts({ pageIndex: 1, pageSize: 6 }));

                // 2. Fetch Banners, Blogs & Promotions
                const [bannerResult, blogResult, promoResult] = await Promise.allSettled([
                    bannerService.getPublicBanners(),
                    blogService.getAllBlogs(1, 4),
                    promotionService.getCurrentPromotions()
                ]);

                if (bannerResult.status === 'fulfilled' && bannerResult.value.data?.data) {
                    const allBanners = bannerResult.value.data.data;
                    setBanners(allBanners.filter((b: any) => b.type === 'SLIDER'));
                } else if (bannerResult.status === 'rejected') {
                    console.log("Error loading banners:", bannerResult.reason);
                }

                if (blogResult.status === 'fulfilled' && blogResult.value.data?.data?.content) {
                    setBlogs(blogResult.value.data.data.content.map(mapBlogResponse));
                } else if (blogResult.status === 'rejected') {
                    console.log("Error loading blogs:", blogResult.reason);
                }

                if (promoResult.status === 'fulfilled') {
                    const raw = promoResult.value.data;
                    const list: Promotion[] = Array.isArray(raw) ? raw : (raw as any)?.data || [];
                    const ongoing = list.filter((p) => p.status === 'ONGOING');
                    setOngoingPromotions(ongoing);

                    // Fetch sản phẩm khuyến mãi từ chương trình đang diễn ra đầu tiên
                    if (ongoing.length > 0) {
                        try {
                            const itemsRes = await promotionService.getPromotionItems(ongoing[0].id, 0, 8);
                            const itemsRaw = itemsRes.data as any;
                            const items: PromotionItemResponse[] = itemsRaw?.data?.content || itemsRaw?.data || [];
                            setPromoItems(items);
                        } catch (e) {
                            console.log("Error loading promo items:", e);
                        }
                    }
                } else {
                    console.log("Error loading promotions:", promoResult.reason);
                }

            } catch (error) {
                console.log("Error loading home data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <StatusBar style="dark" />

            {/* HEADER */}
            <AppHeader showSearch={true} showCart={true} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>

                {/* 1. HERO SLIDER */}
                <View className="mt-4">
                     <HeroSlider banners={banners} />
                </View>

                {/* 2. POLICY ICONS */}
                <PolicySection />

                {/* 3. PROMO BUTTONS */}
                <View className="px-4 mb-8 flex-row gap-3">
                    <TouchableOpacity 
                        className="flex-1 bg-orange-50 p-4 rounded-xl flex-row items-center border border-orange-100 shadow-sm"
                        onPress={() => router.push('/vouchers')}
                    >
                         <View className="bg-orange-500 p-2 rounded-lg mr-2 shadow-sm">
                            <Ionicons name="ticket-outline" size={20} color="white" />
                        </View>
                        <View>
                            <Text className="font-bold text-gray-800 text-xs uppercase">Săn Voucher</Text>
                            <Text className="text-[10px] text-gray-500">Giảm đến 50%</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        className="flex-1 bg-purple-50 p-4 rounded-xl flex-row items-center border border-purple-100 shadow-sm"
                        onPress={() => router.push('/promotions')}
                    >
                         <View className="bg-purple-600 p-2 rounded-lg mr-2 shadow-sm">
                            <Ionicons name="gift-outline" size={20} color="white" />
                        </View>
                        <View>
                            <Text className="font-bold text-gray-800 text-xs uppercase">Khuyến Mãi</Text>
                            <Text className="text-[10px] text-gray-500">Quà tặng HOT</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* 4. ONGOING PROMOTIONS */}
                {ongoingPromotions.length > 0 && (
                    <View className="mb-8">
                        <View className="px-4 flex-row justify-between items-center mb-4">
                            <View className="flex-row items-center">
                                <View className="w-1 h-6 bg-red-500 mr-2 rounded-full" />
                                <Text className="font-bold text-lg text-gray-900">🔥 Đang khuyến mãi</Text>
                            </View>
                            <TouchableOpacity onPress={() => router.push('/promotions')} className="flex-row items-center">
                                <Text className="text-blue-600 text-sm font-medium mr-1">Xem tất cả</Text>
                                <Ionicons name="chevron-forward" size={16} color="#2563EB" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            horizontal
                            data={ongoingPromotions}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <View style={{ width: 280, marginRight: 12 }}>
                                    <PromotionCard promotion={item} />
                                </View>
                            )}
                            contentContainerStyle={{ paddingHorizontal: 16 }}
                            showsHorizontalScrollIndicator={false}
                        />
                    </View>
                )}

                {/* 4b. PROMO PRODUCTS */}
                {promoItems.length > 0 && (
                    <View className="mb-8 bg-red-50 py-6">
                        <View className="px-4 flex-row justify-between items-center mb-4">
                            <View className="flex-row items-center">
                                <View className="w-1 h-6 bg-orange-500 mr-2 rounded-full" />
                                <Text className="font-bold text-lg text-gray-900">Sản phẩm giảm giá</Text>
                            </View>
                            <TouchableOpacity onPress={() => router.push(`/promotions/${ongoingPromotions[0]?.id}`)} className="flex-row items-center">
                                <Text className="text-blue-600 text-sm font-medium mr-1">Xem tất cả</Text>
                                <Ionicons name="chevron-forward" size={16} color="#2563EB" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            horizontal
                            data={promoItems}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => {
                                const originalPrice = item.product?.priceOld > item.salePrice
                                    ? item.product?.priceOld
                                    : item.product?.priceNew > item.salePrice
                                    ? item.product?.priceNew
                                    : null;
                                const discountPct = originalPrice
                                    ? Math.round((1 - item.salePrice / originalPrice) * 100)
                                    : 0;
                                return (
                                <TouchableOpacity
                                    style={{ width: 150, marginRight: 12 }}
                                    className="bg-white rounded-xl overflow-hidden shadow-sm border border-orange-100"
                                    onPress={() => item.product?.slug && router.push(`/product/${item.product.slug}`)}
                                    activeOpacity={0.85}
                                >
                                    <Image
                                        source={{ uri: item.product?.thumbnail }}
                                        className="w-full h-28 bg-gray-100"
                                        resizeMode="cover"
                                    />
                                    {discountPct > 0 && (
                                        <View className="absolute top-2 left-2 bg-red-500 px-1.5 py-0.5 rounded">
                                            <Text className="text-white text-[10px] font-bold">-{discountPct}%</Text>
                                        </View>
                                    )}
                                    <View className="p-2">
                                        <Text className="text-gray-800 text-xs font-medium" numberOfLines={2}>{item.product?.title}</Text>
                                        <Text className="text-red-500 font-bold text-sm mt-1">{item.salePrice?.toLocaleString('vi-VN')}đ</Text>
                                        {originalPrice && (
                                            <Text className="text-gray-400 text-[11px] line-through">{originalPrice?.toLocaleString('vi-VN')}đ</Text>
                                        )}
                                    </View>
                                </TouchableOpacity>
                                );
                            }}
                            contentContainerStyle={{ paddingHorizontal: 16 }}
                            showsHorizontalScrollIndicator={false}
                        />
                    </View>
                )}

                {/* 5. NEW PRODUCTS */}
                <View className="mb-8">
                    <View className="px-4 flex-row justify-between items-center mb-4">
                        <View className="flex-row items-center">
                            <View className="w-1 h-6 bg-blue-600 mr-2 rounded-full" />
                            <Text className="font-bold text-lg text-gray-900">Sản phẩm mới về</Text>
                        </View>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/products')} className="flex-row items-center">
                            <Text className="text-blue-600 text-sm font-medium mr-1">Xem tất cả</Text>
                            <Ionicons name="chevron-forward" size={16} color="#2563EB" />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        horizontal
                        data={products}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <ProductCard
                                product={item}
                                style={{ width: 160, marginRight: 12 }}
                            />
                        )}
                        contentContainerStyle={{ paddingHorizontal: 16 }}
                        showsHorizontalScrollIndicator={false}
                    />
                </View>

                {/* 5. HEALTH CORNER (BLOGS) */}
                {blogs.length > 0 && (
                     <View className="mb-8 bg-blue-50 py-6">
                        <View className="px-4 flex-row justify-between items-center mb-4">
                            <View className="flex-row items-center">
                                <View className="w-1 h-6 bg-green-500 mr-2 rounded-full" />
                                <Text className="font-bold text-lg text-gray-900">Góc sức khỏe</Text>
                            </View>
                            <TouchableOpacity onPress={() => router.push('/blogs')} className="flex-row items-center">
                                <Text className="text-blue-600 text-sm font-medium mr-1">Xem tất cả</Text>
                                <Ionicons name="chevron-forward" size={16} color="#2563EB" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            horizontal
                            data={blogs}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <View className="ml-4 first:ml-4 last:mr-4">
                                     <BlogCard blog={item} layout="vertical" />
                                </View>
                            )}
                            showsHorizontalScrollIndicator={false}
                        />
                    </View>
                )}

                {/* FOOTER */}
                <AppFooter />
            </ScrollView>

            {/* Chat Float Button */}
            <TouchableOpacity
                onPress={() => router.push('/chat')}
                className="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full items-center justify-center shadow-lg z-50 flex-row border-2 border-white"
                style={{ elevation: 5 }}
            >
                <Ionicons name="chatbubbles" size={26} color="white" />
                <View className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full border border-white" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}