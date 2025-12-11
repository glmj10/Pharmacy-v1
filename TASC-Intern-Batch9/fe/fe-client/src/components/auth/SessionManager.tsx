import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import { useAppDispatch } from '../../store/hooks';
import { clearAuth } from '../../store/slices/authSlice';
import { AUTH_EVENTS } from '../../lib/events';

const SessionManager: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { openModal } = useModal();

  useEffect(() => {
    // Hàm xử lý khi nhận được sự kiện hết phiên
    const handleSessionExpired = () => {
      // 1. Xóa sạch dữ liệu trong Redux
      dispatch(clearAuth());

      // 2. Mở Modal thông báo
      openModal(
        'warning', // Icon cảnh báo màu vàng
        'Phiên đăng nhập hết hạn',
        'Vui lòng đăng nhập lại để tiếp tục sử dụng dịch vụ.',
        () => {
          // 3. Khi bấm "Đồng ý" hoặc "Đóng" -> Chuyển về Login
          navigate('/login');
        },
        'Đăng nhập lại', // Tên nút Confirm
        ''               // Ẩn nút Cancel (chỉ cần 1 nút để bắt buộc user)
      );
    };

    // Đăng ký lắng nghe sự kiện
    window.addEventListener(AUTH_EVENTS.SESSION_EXPIRED, handleSessionExpired);

    // Dọn dẹp khi component unmount
    return () => {
      window.removeEventListener(AUTH_EVENTS.SESSION_EXPIRED, handleSessionExpired);
    };
  }, [dispatch, navigate, openModal]);

  return null; // Component này không hiển thị gì cả
};

export default SessionManager;