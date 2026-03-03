import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Phone, Zap, ChevronRight, Calendar } from 'lucide-react';

// Components
import HeroSlider from '../components/home/HeroSlider';
import PromotionSection from '../components/home/PromotionSection';
import ProductSlider from '../components/common/ProductSlider';
import AsyncImage from '../components/common/AsyncImage';

// Services & Types
import bannerService from '../api/bannerService';
import productService from '../api/productService';
import blogService from '../api/blogService';
import type { Banner } from '../types/banner.type';
import type { Blog } from '../types/blog.types';
import type { Product } from '../types/product.types';

const Home: React.FC = () => {
  // State
  const [sliderBanners, setSliderBanners] = useState<Banner[]>([]);
  const [sideBanners, setSideBanners] = useState<Banner[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [latestBlogs, setLatestBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [bannerRes, productRes, blogRes] = await Promise.all([
          bannerService.getPublicBanners(),
          productService.getAll({ limit: 10, isAscending: false } as any), 
          blogService.getAllBlogs(1, 4) // Lấy 4 bài viết mới nhất
        ]);
        const banners = bannerRes.data || (bannerRes as any).result || [];
        setSliderBanners(banners.filter((b: Banner) => b.type === 'SLIDER'));
        setSideBanners(banners.filter((b: Banner) => b.type === 'SIDE').slice(0, 2));

        const pData: any = productRes;
        setNewProducts(pData.data?.content || pData.result?.content || []);

        // 3. Xử lý Blog
        const bData: any = blogRes;
        setLatestBlogs(bData.data?.content || bData.result?.content || []);

      } catch (error) {
        console.error("Lỗi tải dữ liệu trang chủ", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen pb-12 space-y-10">
      
      {/* 1. HERO SECTION (BANNER ĐỘNG) */}
      <section className="bg-white pt-4 pb-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Main Slider */}
            <div className="lg:col-span-2">
               {sliderBanners.length > 0 ? (
                 <HeroSlider banners={sliderBanners} />
               ) : (
                 // Skeleton Loading hoặc Placeholder nếu chưa có banner
                 <div className="h-[200px] md:h-[380px] bg-gray-200 rounded-2xl animate-pulse flex items-center justify-center text-gray-400">Loading Banner...</div>
               )}
            </div>

            {/* Side Banners */}
            <div className="hidden lg:flex flex-col gap-4 h-[380px]">
              {sideBanners.length > 0 ? (
                sideBanners.map(banner => (
                  <Link 
                    key={banner.id} 
                    to={banner.targetUrl || '#'} 
                    className="h-[182px] rounded-2xl overflow-hidden relative shadow-sm group cursor-pointer"
                  >
                    <AsyncImage 
                      src={banner.imageUrl} // AsyncImage tự xử lý URL hoặc UUID
                      alt={banner.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                    />
                  </Link>
                ))
              ) : (
                // Fallback nếu không có Side Banner
                <>
                  <div className="h-[182px] bg-gray-100 rounded-2xl animate-pulse"></div>
                  <div className="h-[182px] bg-gray-100 rounded-2xl animate-pulse"></div>
                </>
              )}
            </div>
          </div>
          
          {/* Policy Icons (Có thể giữ tĩnh hoặc làm động sau) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { icon: ShieldCheck, title: "Thuốc chính hãng", desc: "Đạt chuẩn GPP" },
              { icon: Truck, title: "Giao nhanh 2h", desc: "Miễn phí đơn từ 300k" },
              { icon: Phone, title: "Dược sĩ tư vấn", desc: "Hỗ trợ 24/7" },
              { icon: Zap, title: "Đổi trả 30 ngày", desc: "Thủ tục đơn giản" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                <item.icon className="w-8 h-8 text-primary" />
                <div>
                  <h4 className="font-bold text-gray-800 text-sm md:text-base">{item.title}</h4>
                  <p className="text-xs text-gray-500 hidden md:block">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. CHƯƠNG TRÌNH KHUYẾN MÃI (PROMOTION) */}
      <PromotionSection />

      {/* 3. SẢN PHẨM MỚI (NEW ARRIVALS) */}
      {newProducts.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-2xl font-bold text-slate-800 border-l-4 border-blue-500 pl-3">Sản phẩm mới về</h2>
             <Link to="/products" className="text-primary hover:underline text-sm flex items-center gap-1">
               Xem tất cả <ChevronRight className="w-4 h-4" />
             </Link>
          </div>
          {/* Dùng ProductSlider để hiển thị danh sách ngang */}
          <ProductSlider products={newProducts} />
        </section>
      )}

      {/* 4. GÓC SỨC KHỎE (BLOGS) */}
      {latestBlogs.length > 0 && (
        <section className="bg-white py-10">
          <div className="container mx-auto px-4">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-slate-800 border-l-4 border-green-500 pl-3">Góc sức khỏe</h2>
                <Link to="/blogs" className="text-primary hover:underline text-sm flex items-center gap-1">
                  Xem tất cả <ChevronRight className="w-4 h-4" />
                </Link>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {latestBlogs.map(blog => (
                   <Link to={`/blogs/${blog.slug}`} key={blog.id} className="group h-full flex flex-col">
                      <div className="rounded-xl overflow-hidden mb-3 h-48 border border-gray-100">
                         <AsyncImage 
                           src={blog.thumbnail} 
                           className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                         />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                           <Calendar className="w-3 h-3" />
                           {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                        <h3 className="font-bold text-slate-800 line-clamp-2 group-hover:text-primary transition mb-2">
                          {blog.title}
                        </h3>
                        {/* Trích dẫn ngắn gọn (Strip HTML tags) */}
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {blog.content.replace(/<[^>]+>/g, '')}
                        </p>
                      </div>
                   </Link>
                ))}
             </div>
          </div>
        </section>
      )}

    </div>
  );
};

export default Home;