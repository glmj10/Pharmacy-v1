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
    const handleSessionExpired = () => {
      // 1. Xóa sạch dữ liệu đăng nhập ngay lập tức để tránh lỗi lặp lại
      dispatch(clearAuth());

      // 2. Hiển thị Modal thông báo riêng biệt
      openModal(
        'warning', // Icon cảnh báo màu vàng
        'Phiên đăng nhập đã hết hạn', // Tiêu đề
        'Để bảo mật tài khoản, phiên làm việc của bạn đã kết thúc. Vui lòng đăng nhập lại để tiếp tục mua sắm.', // Nội dung chi tiết
        () => {
          // 3. Khi bấm nút -> Chuyển về trang Login
          navigate('/login');
        },
        'Đăng nhập lại', // Nút chính
        '' // Để trống nút phụ (Cancel) để bắt buộc người dùng phải bấm Đăng nhập lại
      );
    };

    // Đăng ký lắng nghe sự kiện từ axiosClient
    window.addEventListener(AUTH_EVENTS.SESSION_EXPIRED, handleSessionExpired);

    return () => {
      window.removeEventListener(AUTH_EVENTS.SESSION_EXPIRED, handleSessionExpired);
    };
  }, [dispatch, navigate, openModal]);

  return null; // Component này không có giao diện (Headless)
};

export default SessionManager;