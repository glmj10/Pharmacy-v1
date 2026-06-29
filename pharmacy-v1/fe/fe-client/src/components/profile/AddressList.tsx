import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, MapPin, User, Phone, CheckCircle2 } from 'lucide-react';
import type { Profile } from '../../types/profile.types';
import profileService from '../../api/profileService';
import AddressModal from './AddressModal';
import { useModal } from '../../context/ModalContext';
import { useToast } from '../../context/ToastContext';
import { cn } from '../../lib/utils';

interface AddressListProps {
  mode: 'management' | 'selection';
  selectedId?: number;
  onSelect?: (profile: Profile) => void;
}

const AddressList: React.FC<AddressListProps> = ({ mode, selectedId, onSelect }) => {
  const { openModal } = useModal();
  const { toast } = useToast();
  
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const res: any = await profileService.getUserProfiles();
      setProfiles(res.data || res.result || []);
    } catch (error) {
      console.error("Failed to load profiles", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleDelete = (id: number) => {
    openModal('warning', 'Xác nhận xóa', 'Bạn có chắc chắn muốn xóa địa chỉ này không?', async () => {
      try {
        await profileService.deleteProfile(id);
        toast.success('Đã xóa', 'Địa chỉ đã được xóa thành công');
        fetchProfiles();
      } catch (error) {
        toast.error('Lỗi', 'Không thể xóa địa chỉ này');
      }
    });
  };

  const handleEdit = (e: React.MouseEvent, profile: Profile) => {
    e.stopPropagation(); // Ngăn việc click sửa lại kích hoạt onSelect
    setEditingProfile(profile);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingProfile(null);
    setIsModalOpen(true);
  };

  // Callback khi Modal đóng và thành công
  const handleModalSuccess = (newProfile?: Profile) => {
    // 1. Reload danh sách
    fetchProfiles();
    
    // 2. Nếu là tạo mới VÀ đang ở chế độ chọn -> Tự động chọn cái vừa tạo
    if (newProfile && mode === 'selection' && onSelect) {
      onSelect(newProfile);
    }
  };

  if (loading) return <div className="p-4 text-center text-gray-500 text-sm">Đang tải danh sách địa chỉ...</div>;

  return (
    <div>
      <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
        {profiles.map((profile) => (
          <div 
            key={profile.id}
            onClick={() => mode === 'selection' && onSelect && onSelect(profile)}
            className={cn(
              "relative p-4 rounded-xl border-2 transition-all duration-200 bg-white",
              mode === 'selection' 
                ? (selectedId === profile.id 
                    ? "border-primary bg-blue-50/50 shadow-md cursor-default" 
                    : "border-gray-100 hover:border-blue-200 cursor-pointer hover:shadow-sm")
                : "border-gray-100 shadow-sm"
            )}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" /> {profile.fullName}
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {profile.phoneNumber}
                </span>
              </div>
              
              {mode === 'management' && (
                <div className="flex gap-2">
                  <button onClick={(e) => handleEdit(e, profile)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Sửa">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(profile.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition" title="Xóa">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {mode === 'selection' && selectedId === profile.id && (
                <CheckCircle2 className="w-6 h-6 text-primary fill-blue-50" />
              )}
            </div>

            <div className="flex items-start gap-2 text-sm text-gray-600 mt-2">
              <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-gray-400" />
              <span className="leading-relaxed">{profile.address}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Nút Thêm Mới */}
      <button 
        type="button" // Quan trọng: type button để không submit form Checkout
        onClick={handleAddNew}
        className="flex items-center justify-center gap-2 w-full p-3 mt-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-primary hover:text-primary hover:bg-blue-50/50 transition duration-200 group"
      >
        <div className="p-1 bg-gray-100 rounded-full group-hover:bg-blue-100 transition">
          <Plus className="w-4 h-4" />
        </div>
        <span className="font-medium text-sm">Thêm địa chỉ mới</span>
      </button>

      {/* Modal Form */}
      <AddressModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleModalSuccess} // Sử dụng hàm handle mới
        initialData={editingProfile}
      />
    </div>
  );
};

export default AddressList;