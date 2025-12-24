import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2, User, Camera } from 'lucide-react';
import identityService from '../../api/identityService';
import { useToast } from '../../context/ToastContext';
import { useAppDispatch } from '../../store/hooks';
import { updateUser } from '../../store/slices/authSlice';
import { type User as UserType } from '../../types';
import AsyncImage from '../common/AsyncImage';
import { cn } from '../../lib/utils';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any; // UserResponse từ API getMe
  onSuccess: () => void; // Callback để reload data ở trang cha
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, currentUser, onSuccess }) => {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<{ username: string }>();
  
  // State quản lý file ảnh
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && currentUser) {
      reset({ username: currentUser.username });
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  }, [isOpen, currentUser, reset]);

  // Xử lý chọn ảnh
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size/type (ví dụ < 2MB, chỉ ảnh)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Lỗi', 'Dung lượng ảnh không được quá 2MB');
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  if (!isOpen) return null;

  const onSubmit = async (data: { username: string }) => {
    try {
      // Gọi API (chú ý tham số file là optional)
      const res: any = await identityService.changeInfo(
        { username: data.username },
        selectedFile || undefined
      );

      // Cập nhật Redux Store ngay lập tức
      const updatedUser: UserType = res.data || res.result;
      dispatch(updateUser(updatedUser));

      toast.success('Thành công', 'Cập nhật hồ sơ thành công!');
      onSuccess(); // Gọi callback để Profile page reload data mới nhất
      onClose();
    } catch (error: any) {
      toast.error('Lỗi', error.response?.data?.message || 'Cập nhật thất bại.');
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> Chỉnh sửa hồ sơ
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          
          {/* 1. UPLOAD AVATAR */}
          <div className="flex flex-col items-center">
            <div className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-full border-4 border-gray-100 overflow-hidden bg-gray-50">
                {previewUrl ? (
                  <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <AsyncImage src={currentUser?.profilePic} className="w-full h-full object-cover" />
                )}
              </div>
              
              {/* Nút camera overlay */}
              <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-full cursor-pointer">
                <Camera className="w-8 h-8 text-white" />
              </label>
              <input 
                id="avatar-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Nhấn vào ảnh để thay đổi (Max 2MB)</p>
          </div>

          {/* 2. USERNAME */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tên hiển thị</label>
            <input
              {...register('username', { required: 'Tên hiển thị không được để trống' })}
              className={cn("w-full px-4 py-2 border rounded-lg focus:ring-primary outline-none", errors.username && "border-red-500")}
            />
            {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>}
          </div>

          {/* 3. EMAIL (READONLY) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              value={currentUser?.email || ''}
              disabled
              className="w-full px-4 py-2 border border-gray-200 bg-gray-100 rounded-lg text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Không thể thay đổi email.</p>
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition">
              Hủy bỏ
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-blue-600 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-100">
              {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;