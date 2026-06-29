import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Gift, Sparkles } from 'lucide-react';
import promotionService from '../../api/promotionService';
import AsyncImage from '../common/AsyncImage';
import CountdownTimer from '../common/CountdownTimer';
import ProductSlider from '../common/ProductSlider';
import { cn } from '../../lib/utils';
import type { Promotion } from '../../types/promotion.type';
import type { Product } from '../../types/product.types';

interface PromotionWithProducts {
  info: Promotion;
  products: Product[];
}

const PromotionSection: React.FC = () => {
  const [promotionsData, setPromotionsData] = useState<PromotionWithProducts[]>([]);
  const [activeTabId, setActiveTabId] = useState<number | null>(null); // State lưu Tab đang chọn
  const [loading, setLoading] = useState(true);

  const mapPromoItemToProduct = (item: any): Product => {
    const rawProduct = item.product;
    console.log(rawProduct)
    return {
      id: rawProduct.id,
      title: rawProduct.name || rawProduct.title,
      priceNew: rawProduct.priceNew,
      priceOld: rawProduct.priceOld,
      thumbnail: rawProduct.thumbnail,
      slug: rawProduct.slug,
      quantity: rawProduct.quantity || 0,
      active: true,
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resPromo: any = await promotionService.getCurrentPromotions();
        const promoList: Promotion[] = resPromo.data || resPromo.result || [];

        if (promoList.length === 0) {
          setLoading(false);
          return;
        }

        const limitedPromoList = promoList.slice(0, 5);

        const promises = limitedPromoList.map(async (promo) => {
          try {
            const resItems: any = await promotionService.getPromotionItems(promo.id, 0, 10);
            const itemsData = resItems.data?.content || resItems.result?.content || [];
            return {
              info: promo,
              products: itemsData.map(mapPromoItemToProduct)
            };
          } catch (err) {
            return null;
          }
        });

        const results = await Promise.all(promises);
        const validResults = results.filter(item => item !== null && item.products.length > 0) as PromotionWithProducts[];
        
        setPromotionsData(validResults);
        
        // Mặc định chọn Tab đầu tiên
        if (validResults.length > 0) {
          setActiveTabId(validResults[0].info.id);
        }

      } catch (error) {
        console.error("Lỗi tải section khuyến mãi", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return null;
  if (promotionsData.length === 0) return null;

  // Tìm dữ liệu của Tab đang active
  const activeData = promotionsData.find(p => p.info.id === activeTabId);
  console.log(activeData)

  if (!activeData) return null;

  return (
    <section className="container mx-auto px-4 py-4">
      
      {/* 1. HEADER & TABS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg text-white shadow-md">
            <Gift className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Sự kiện khuyến mãi</h2>
        </div>

        {/* Danh sách Tabs (Scrollable trên mobile) */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {promotionsData.map((item) => (
            <button
              key={item.info.id}
              onClick={() => setActiveTabId(item.info.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 border",
                activeTabId === item.info.id
                  ? "bg-slate-900 text-white border-slate-900 shadow-md transform scale-105"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-50"
              )}
            >
              {item.info.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2. ACTIVE CONTENT (Có hiệu ứng Fade in) */}
      <div key={activeTabId} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        
        {/* Banner của Active Tab */}
        <div className="relative rounded-2xl overflow-hidden mb-6 shadow-lg group h-[200px] md:h-[280px]">
          {/* Background Image */}
          <div className="absolute inset-0">
            <AsyncImage 
              src={activeData.info.thumbnailUrl} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Overlay Gradient tối để làm nổi chữ */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-transparent"></div>
          </div>

          {/* Banner Content */}
          <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-10 max-w-3xl">
            <div className="flex items-center gap-2 mb-3 text-yellow-400 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-4 h-4" /> Đang diễn ra
            </div>
            
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight shadow-black drop-shadow-md">
              {activeData.info.name}
            </h3>

            <div className="flex flex-wrap items-center gap-4">
              {/* Countdown */}
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white text-sm">
                <Clock className="w-4 h-4" />
                <span>Còn lại:</span>
                <div className="font-mono font-bold text-yellow-300">
                  <CountdownTimer targetDate={activeData.info.endTime} />
                </div>
              </div>

              {/* View Detail Button */}
              <Link 
                to={`/promotions/${activeData.info.id}`}
                className="px-5 py-2 bg-white text-slate-900 font-bold rounded-lg hover:bg-blue-50 transition shadow-lg flex items-center gap-2 text-sm"
              >
                Xem chi tiết <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Slider sản phẩm của Active Tab */}
        <div className="-mt-2">
           <ProductSlider products={activeData.products} />
        </div>

      </div>
    </section>
  );
};

export default PromotionSection;