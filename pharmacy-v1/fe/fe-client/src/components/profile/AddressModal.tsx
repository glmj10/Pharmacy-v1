import React, { useEffect } from 'react';
import ReactDOM from 'react-dom'; // <== 1. Import ReactDOM
import { useForm } from 'react-hook-form';
import { X, Loader2, Save } from 'lucide-react';
import type { Profile, ProfileRequest } from '../../types/profile.types';
import profileService from '../../api/profileService';
import { useToast } from '../../context/ToastContext';
import { REGEX } from '../../lib/constants';
import { cn } from '../../lib/utils';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newProfile?: Profile) => void;
  initialData?: Profile | null;
}

const AddressModal: React.FC<AddressModalProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProfileRequest>();

  useEffect(() => {
    if (isOpen) {
      reset({
        fullName: initialData?.fullName || '',
        phoneNumber: initialData?.phoneNumber || '',
        address: initialData?.address || '',
      });
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: ProfileRequest) => {
    // Ngăn chặn sự kiện nổi bọt lên form cha (Checkout)
    try {
      let resultProfile: Profile | undefined;

      if (initialData) {
        const res: any = await profileService.updateProfile(initialData.id, data);
        resultProfile = res.data || res.result;
        toast.success('Thành công', 'Cập nhật địa chỉ thành công');
      } else {
        const res: any = await profileService.createProfile(data);
        resultProfile = res.data || res.result;
        toast.success('Thành công', 'Thêm địa chỉ mới thành công');
      }

      onSuccess(resultProfile);
      onClose();
    } catch (error: any) {
      toast.error('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  // Nội dung Modal
  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()} // Ngăn click xuyên qua
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-slate-800">
            {initialData ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
          </h3>
          <button 
            type="button" // Quan trọng: type="button" để không submit form
            onClick={onClose} 
            className="p-1 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form 
          onSubmit={(e) => {
            e.stopPropagation(); // Ngăn submit nổi bọt lên form cha
            handleSubmit(onSubmit)(e);
          }} 
          className="p-6 space-y-4"
        >
          
          {/* ... (Các ô input giữ nguyên như cũ) ... */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên</label>
            <input
              {...register('fullName', { required: 'Vui lòng nhập họ tên' })}
              className={cn("w-full px-4 py-2 border rounded-lg focus:ring-primary outline-none", errors.fullName && "border-red-500")}
              placeholder="Nguyễn Văn A"
            />
            {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại</label>
            <input
              {...register('phoneNumber', { 
                required: 'Vui lòng nhập số điện thoại',
                pattern: { value: REGEX.PHONE_VN, message: 'Số điện thoại không hợp lệ' }
              })}
              className={cn("w-full px-4 py-2 border rounded-lg focus:ring-primary outline-none", errors.phoneNumber && "border-red-500")}
              placeholder="09xx..."
            />
            {errors.phoneNumber && <p className="text-xs text-red-500 mt-1">{errors.phoneNumber.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ chi tiết</label>
            <textarea
              {...register('address', { required: 'Vui lòng nhập địa chỉ' })}
              rows={3}
              className={cn("w-full px-4 py-2 border rounded-lg focus:ring-primary outline-none", errors.address && "border-red-500")}
              placeholder="Số nhà, đường, phường/xã, quận/huyện..."
            />
            {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button" // Quan trọng
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-blue-600 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
            >
              {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : <><Save className="w-4 h-4" /> Lưu địa chỉ</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // ===> SỬ DỤNG PORTAL ĐỂ ĐƯA MODAL RA KHỎI FORM CHA <===
  return ReactDOM.createPortal(modalContent, document.body);
};

export default AddressModal;