import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Tag, Clock, Gift } from 'lucide-react'; // Đổi icon Zap -> Tag/Gift

import promotionService from '../api/promotionService';
import ProductCard from '../components/product/ProductCard';
import Breadcrumb from '../components/common/BreadCrumb';
import CountdownTimer from '../components/common/CountdownTimer'; // Tái sử dụng component đếm ngược
import type { Product } from '../types';
import type { Promotion } from '../types/promotion.type';
import type { PromotionItemResponse } from '../types/promotionItem';
import AsyncImage from '../components/common/AsyncImage';

const PromotionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // State
  const [promotionInfo, setPromotionInfo] = useState<Promotion | null>(null); // Thông tin chương trình
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Pagination
  const [pageIndex, setPageIndex] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // 1. Fetch Thông tin chương trình (Để lấy Tên & Thời gian)
  useEffect(() => {
    const fetchInfo = async () => {
      if (!id) return;
      try {
        const promo = await promotionService.getPromotionDetail(Number(id));
        setPromotionInfo(promo || null);
      } catch (error) {
        console.error("Lỗi lấy thông tin khuyến mãi", error);
      }
    };
    fetchInfo();
  }, [id]);

  // 2. Fetch Sản phẩm (Giữ nguyên logic cũ nhưng tách ra hàm clean hơn)
  const fetchProducts = async (isLoadMore = false) => {
    if (!id) return;
    try {
      const currentPage = isLoadMore ? pageIndex + 1 : 0;
      const res: any = await promotionService.getPromotionItems(id, currentPage, 12);
      
      const pageData = res.data || res.result;
      const promoItems: PromotionItemResponse[] = pageData?.content || [];
      const totalPages = pageData?.totalPages || 0;

      // Map dữ liệu
      const mappedProducts = promoItems.map(item => ({
        id: item.product.id,
        title: item.product.title,
        priceNew: item.product.priceNew, // Giá KM
        priceOld: item.product.priceOld,
        thumbnail: item.product.thumbnail,
        slug: item.product.slug,
        quantity: item.product.quantity || 0,
        active: true
      }));

      if (isLoadMore) {
        setProducts(prev => [...prev, ...mappedProducts]);
        setPageIndex(currentPage);
      } else {
        setProducts(mappedProducts);
        setPageIndex(0);
      }

      setHasMore(currentPage < totalPages - 1);

    } catch (error) {
      console.error("Lỗi tải sản phẩm", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProducts(false);
    window.scrollTo(0, 0);
  }, [id]);

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      
      {/* ===> BANNER KHUYẾN MÃI (CẬP NHẬT) <=== */}
      <div className="relative overflow-hidden h-[300px] md:h-[400px] bg-slate-900">
        
        {/* 1. ẢNH NỀN (Dùng thumbnailUrl từ promotionInfo) */}
        <div className="absolute inset-0">
          {promotionInfo?.thumbnailUrl ? (
            <AsyncImage 
              src={promotionInfo.thumbnailUrl.startsWith('http') ? promotionInfo.thumbnailUrl : undefined}
              className="w-full h-full object-cover opacity-60" 
            />
          ) : (
            // Fallback Gradient nếu chưa tải xong hoặc không có ảnh
            <div className="w-full h-full bg-gradient-to-r from-blue-900 to-slate-900"></div>
          )}
          {/* Lớp phủ tối để chữ dễ đọc hơn */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
        </div>

        {/* 2. NỘI DUNG BANNER (Nằm đè lên ảnh) */}
        <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-10 relative z-10 text-white">
          <Breadcrumb 
            items={[{ label: "Chương trình khuyến mãi", link: "/" }, { label: promotionInfo?.name || "Chi tiết" }]} 
            className="text-white/80 mb-4 [&_a]:text-white/80 [&_a:hover]:text-white [&_span]:text-white"
          />
          
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-3 border border-white/10">
                <Gift className="w-4 h-4" /> Sự kiện ưu đãi
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-3 leading-tight drop-shadow-lg">
                {promotionInfo?.name || "Đang tải thông tin..."}
              </h1>
              <p className="text-blue-100 max-w-xl text-sm md:text-base drop-shadow-md">
                Cơ hội mua sắm các sản phẩm chính hãng với mức giá ưu đãi nhất.
              </p>
            </div>

            {/* Countdown Box */}
            {promotionInfo?.endTime && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 min-w-[200px] shadow-lg">
                <div className="flex items-center gap-2 text-blue-100 text-xs font-semibold uppercase mb-2">
                  <Clock className="w-4 h-4" /> Thời gian còn lại
                </div>
                <CountdownTimer targetDate={promotionInfo.endTime} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 min-h-[400px]">
          
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" /> Sản phẩm khuyến mãi
            </h2>
            <span className="text-sm text-gray-500">Hiển thị {products.length} sản phẩm</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {[...Array(4)].map((_, i) => (
                 <div key={i} className="h-80 bg-gray-100 rounded-xl animate-pulse"></div>
               ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Load More */}
              <div className="mt-12 text-center">
                {hasMore ? (
                  <button 
                    onClick={() => { setLoadingMore(true); fetchProducts(true); }}
                    disabled={loadingMore}
                    className="px-8 py-2.5 bg-white border border-gray-300 text-slate-700 font-medium rounded-full hover:bg-gray-50 hover:border-primary hover:text-primary transition-all shadow-sm disabled:opacity-70"
                  >
                    {loadingMore ? (
                      <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Đang tải...</span>
                    ) : (
                      "Xem thêm sản phẩm"
                    )}
                  </button>
                ) : (
                  <span className="text-gray-400 text-sm italic">Bạn đã xem hết danh sách</span>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <p>Chương trình này hiện chưa có sản phẩm nào.</p>
              <Link to="/" className="text-primary hover:underline mt-2 inline-block">Quay về trang chủ</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromotionDetail;