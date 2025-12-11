import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Star, Loader2, Send } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';
import rateService from '../../api/rateService';
import AsyncImage from '../common/AsyncImage';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderDetailId: number | null; // ID của dòng sản phẩm trong đơn hàng
  productInfo?: {               // Thông tin sản phẩm để hiển thị cho user biết đang đánh giá cái gì
    title: string;
    thumbnail: string;
  } | null;
  onSuccess?: () => void;
}

interface RatingFormInputs {
  comment: string;
}

const RatingModal: React.FC<RatingModalProps> = ({ isOpen, onClose, orderDetailId, productInfo, onSuccess }) => {
  const { toast } = useToast();
  const [rating, setRating] = useState(5); // Mặc định 5 sao
  const [hoverRating, setHoverRating] = useState(0); // Hiệu ứng hover sao

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<RatingFormInputs>();

  // Reset form khi mở modal mới
  useEffect(() => {
    if (isOpen) {
      reset({ comment: '' });
      setRating(5);
    }
  }, [isOpen, orderDetailId, reset]);

  if (!isOpen || !orderDetailId) return null;

  const onSubmit = async (data: RatingFormInputs) => {
    try {
      await rateService.createRate({
        rating: rating,
        orderDetailId: orderDetailId,
        comment: data.comment
      });

      toast.success('Đánh giá thành công', 'Cảm ơn bạn đã nhận xét về sản phẩm!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      toast.error('Lỗi', error.response?.data?.message || 'Không thể gửi đánh giá.');
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-slate-800">Đánh giá sản phẩm</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          
          {/* Product Info Preview */}
          {productInfo && (
            <div className="flex items-center gap-4 bg-blue-50 p-3 rounded-xl border border-blue-100">
              <div className="w-12 h-12 shrink-0 border rounded-lg overflow-hidden bg-white">
                <AsyncImage uuid={productInfo.thumbnail} className="w-full h-full object-cover" />
              </div>
              <p className="text-sm font-medium text-slate-800 line-clamp-2">{productInfo.title}</p>
            </div>
          )}

          {/* Star Rating Selection */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-semibold text-gray-500">Chất lượng sản phẩm</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star 
                    className={cn(
                      "w-8 h-8 transition-colors", 
                      star <= (hoverRating || rating) 
                        ? "fill-yellow-400 text-yellow-400" 
                        : "text-gray-300"
                    )} 
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-medium text-yellow-600 h-4">
              {rating === 5 && "Tuyệt vời"}
              {rating === 4 && "Hài lòng"}
              {rating === 3 && "Bình thường"}
              {rating === 2 && "Không hài lòng"}
              {rating === 1 && "Tệ"}
            </p>
          </div>

          {/* Comment Area */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Nhận xét của bạn</label>
            <textarea
              {...register('comment')}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary outline-none transition resize-none placeholder:text-sm"
              placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm này nhé..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-blue-600 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
            >
              {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : <><Send className="w-4 h-4" /> Gửi đánh giá</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default RatingModal;