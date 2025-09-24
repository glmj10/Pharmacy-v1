import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import NotificationModal from '../NotificationModal/NotificationModal';
import './ResendVerificationModal.css';

const ResendVerificationModal = ({ isOpen, onClose }) => {
  const { sendVerificationEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({
    type: 'success',
    title: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setNotificationData({
        type: 'error',
        title: 'Lỗi',
        message: 'Vui lòng nhập email!'
      });
      setShowNotification(true);
      return;
    }

    setLoading(true);
    try {
      await sendVerificationEmail(email);
      setNotificationData({
        type: 'success',
        title: 'Gửi email thành công!',
        message: 'Đã gửi lại email xác thực! Vui lòng kiểm tra hộp thư của bạn.'
      });
      setShowNotification(true);
      setEmail('');
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Gửi email thất bại';
      setNotificationData({
        type: 'error',
        title: 'Gửi email thất bại',
        message: message
      });
      setShowNotification(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="resend-modal-overlay" onClick={handleOverlayClick}>
        <div className="resend-modal">
          <div className="resend-modal-header">
            <h2 className="resend-modal-title">Gửi lại email xác thực</h2>
            <button className="resend-modal-close" onClick={onClose}>
              ×
            </button>
          </div>
          <div className="resend-modal-body">
            <form onSubmit={handleSubmit} className="resend-form">
              <div className="form-group">
                <label htmlFor="resend-email">Email</label>
                <input
                  type="email"
                  id="resend-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email đã đăng ký"
                  required
                />
              </div>
              <div className="resend-modal-actions">
                <button type="button" className="btn-cancel" onClick={onClose}>
                  Hủy
                </button>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'Đang gửi...' : 'Gửi lại email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showNotification && (
        <NotificationModal
          type={notificationData.type}
          title={notificationData.title}
          message={notificationData.message}
          onClose={() => setShowNotification(false)}
        />
      )}
    </>
  );
};

export default ResendVerificationModal;