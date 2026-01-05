import React, { useState, useEffect } from 'react';
import { Star, User, Loader2, MessageSquare, ThumbsUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import rateService from '../../api/rateService';
import { type RateResponse } from '../../types/rate.types';
import AsyncImage from '../common/AsyncImage';

interface ProductReviewsProps {
  productId: number;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  // State Data
  const [reviews, setReviews] = useState<RateResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // ===> STATE MỚI: TỔNG SỐ LƯỢNG ĐÁNH GIÁ <===
  const [totalCount, setTotalCount] = useState(0);

  // State Pagination & Filter
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const PAGE_SIZE = 5;

  const fetchReviews = async (isLoadMore = false) => {
    try {
      const currentPage = isLoadMore ? page + 1 : 1;
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      const res: any = await rateService.getRatesByProduct(
        productId, 
        currentPage, 
        PAGE_SIZE, 
        filterRating || undefined
      );

      const pageData = res.data || res.result; 
      
      const newReviews = pageData?.content || [];
      const totalPages = pageData?.totalPages || 0;
      
      // ===> CẬP NHẬT TỔNG SỐ LƯỢNG TỪ API <===
      if (pageData?.totalElements) {
        setTotalCount(pageData.totalElements);
      }

      if (isLoadMore) {
        setReviews(prev => [...prev, ...newReviews]);
        setPage(currentPage);
      } else {
        setReviews(newReviews);
        setPage(1);
      }

      if (currentPage >= totalPages) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

    } catch (error) {
      console.error("Lỗi tải đánh giá", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchReviews(false);
  }, [productId, filterRating]);

  // Handler đổi filter (Giữ nguyên)
  const handleFilterChange = (rating: number | null) => {
    if (filterRating === rating) return;
    setFilterRating(rating);
  };

  // Helper render sao (Giữ nguyên)
  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          className={cn("w-3 h-3", i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300")} 
        />
      ))}
    </div>
  );

  return (
    <div className="mt-12 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm" id="reviews">
      <div className="p-6 md:p-8">
        
        {/* Header với Tổng số lượng */}
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          Đánh giá từ khách hàng 
          <span className="text-sm font-normal text-gray-500">
            ({totalCount} lượt {filterRating ? `cho ${filterRating} sao` : ''})
          </span>
        </h3>

        {/* ... (Phần Bộ lọc giữ nguyên) ... */}
        <div className="flex flex-wrap items-center gap-3 mb-8 pb-6 border-b border-gray-100">
          <span className="text-sm font-semibold text-slate-700 mr-2">Lọc theo:</span>
          
          <button 
            onClick={() => handleFilterChange(null)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium border transition",
              filterRating === null 
                ? "bg-primary text-white border-primary" 
                : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
            )}
          >
            Tất cả
          </button>
          
          {[5, 4, 3, 2, 1].map(star => (
            <button 
              key={star}
              onClick={() => handleFilterChange(star)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium border transition flex items-center gap-1",
                filterRating === star 
                  ? "bg-primary text-white border-primary" 
                  : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
              )}
            >
              {star} <Star className="w-3 h-3 fill-current" />
            </button>
          ))}
        </div>

        {/* ... (Phần Danh sách đánh giá & Load More giữ nguyên) ... */}
        {loading && !loadingMore ? (
          <div className="py-10 text-center flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="text-gray-500 text-sm">Đang tải đánh giá...</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">Chưa có đánh giá nào {filterRating ? `cho mức ${filterRating} sao` : ''}.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
                    {review.userResponse?.profilePicUrl ? (
                      <AsyncImage 
                        src={review.userResponse.profilePicUrl}
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="font-bold text-gray-400 text-xs">
                        {review.userResponse?.username?.[0]?.toUpperCase() || <User className="w-5 h-5" />}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-slate-900 text-sm">{review.userResponse?.username || "Người dùng ẩn danh"}</h4>
                    </div>
                    
                    <div className="mb-2">
                      {renderStars(review.rating)}
                    </div>

                    {review.comment && review.comment.trim() !== '' && (
                      <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100 inline-block min-w-[50%] mt-1">
                        {review.comment}
                      </p>
                    )}
                    
                    <div className="mt-2 flex items-center gap-4">
                        <button className="text-xs text-gray-400 hover:text-primary flex items-center gap-1 transition">
                            <ThumbsUp className="w-3 h-3" /> Hữu ích?
                        </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="text-center pt-4">
                <button 
                  onClick={() => fetchReviews(true)}
                  disabled={loadingMore}
                  className="px-6 py-2 bg-white border border-gray-300 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-50 transition disabled:opacity-70"
                >
                  {loadingMore ? <span className="flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Đang tải...</span> : "Xem thêm đánh giá"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;