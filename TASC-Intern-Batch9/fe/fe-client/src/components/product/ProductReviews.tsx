import React, { useState } from 'react';
import { Star, ThumbsUp, MessageSquare, User } from 'lucide-react';
import { cn } from '../../lib/utils';

// Dữ liệu giả (Mock Data)
const MOCK_REVIEWS = [
  {
    id: 1,
    user: "Nguyễn Thu Hà",
    avatar: "", // Để trống sẽ hiện icon mặc định
    rating: 5,
    date: "20/10/2023",
    comment: "Sản phẩm đóng gói cẩn thận, giao hàng nhanh. Mình dùng được 1 tuần thấy cải thiện rõ rệt.",
    purchased: true,
  },
  {
    id: 2,
    user: "Trần Văn Nam",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100",
    rating: 4,
    date: "15/10/2023",
    comment: "Giá tốt hơn tiệm thuốc gần nhà. Tuy nhiên hộp hơi móp xíu do vận chuyển.",
    purchased: true,
  },
  {
    id: 3,
    user: "Phạm Minh",
    avatar: "",
    rating: 5,
    date: "10/10/2023",
    comment: "Hàng chính hãng, check mã vạch OK. Sẽ ủng hộ shop dài dài.",
    purchased: true,
  },
  {
    id: 4,
    user: "Lê Thị Bích",
    avatar: "",
    rating: 3,
    date: "05/10/2023",
    comment: "Giao hàng hơi chậm so với dự kiến.",
    purchased: true,
  }
];

const ProductReviews: React.FC = () => {
  const [filterStar, setFilterStar] = useState<number | 'all'>('all');

  const filteredReviews = filterStar === 'all' 
    ? MOCK_REVIEWS 
    : MOCK_REVIEWS.filter(r => r.rating === filterStar);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={cn(
              "w-4 h-4", 
              i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            )} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="mt-12 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm" id="reviews">
      <div className="p-6 md:p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          Đánh giá & Nhận xét
          <span className="text-sm font-normal text-gray-500">({MOCK_REVIEWS.length} lượt)</span>
        </h3>

        {/* 1. Phần Tổng quan (Summary) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 pb-8 border-b border-gray-100">
          {/* Cột điểm số trung bình */}
          <div className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-xl text-center">
            <div className="text-5xl font-bold text-primary mb-2">4.8</div>
            <div className="flex gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-sm text-gray-500">Dựa trên 50 đánh giá</p>
          </div>

          {/* Cột thanh tỉ lệ (Progress bars) */}
          <div className="col-span-2 space-y-3">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-3 text-sm">
                <span className="w-8 font-medium text-gray-600 flex items-center gap-1">
                  {star} <Star className="w-3 h-3 fill-gray-400 text-gray-400" />
                </span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400 rounded-full" 
                    style={{ width: star === 5 ? '70%' : star === 4 ? '20%' : '5%' }} 
                  ></div>
                </div>
                <span className="w-10 text-right text-gray-400 text-xs">
                  {star === 5 ? '70%' : star === 4 ? '20%' : '5%'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Bộ lọc & Nút viết đánh giá */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button 
              onClick={() => setFilterStar('all')}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium border transition whitespace-nowrap",
                filterStar === 'all' 
                  ? "bg-primary text-white border-primary" 
                  : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
              )}
            >
              Tất cả
            </button>
            {[5, 4, 3, 2, 1].map(star => (
              <button 
                key={star}
                onClick={() => setFilterStar(star)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium border transition whitespace-nowrap",
                  filterStar === star 
                    ? "bg-primary text-white border-primary" 
                    : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
                )}
              >
                {star} Sao
              </button>
            ))}
          </div>
          
          {/* <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Viết đánh giá
          </button> */}
        </div>

        {/* 3. Danh sách đánh giá */}
        <div className="space-y-6">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {review.avatar ? (
                      <img src={review.avatar} alt={review.user} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-slate-900">{review.user}</h4>
                      <span className="text-xs text-gray-400">{review.date}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(review.rating)}
                      {review.purchased && (
                         <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                           <span className="w-1 h-1 rounded-full bg-green-600"></span> Đã mua hàng
                         </span>
                      )}
                    </div>

                    <p className="text-gray-700 text-sm leading-relaxed mb-3">
                      {review.comment}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary transition">
                        <ThumbsUp className="w-3.5 h-3.5" /> Hữu ích (2)
                      </button>
                      <button className="text-xs text-gray-500 hover:text-primary transition">
                        Gửi trả lời
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              Chưa có đánh giá nào {filterStar !== 'all' && `cho mức ${filterStar} sao`}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;