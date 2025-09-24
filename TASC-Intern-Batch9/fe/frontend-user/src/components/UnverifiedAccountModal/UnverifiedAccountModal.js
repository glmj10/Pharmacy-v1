import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import NotificationModal from '../NotificationModal/NotificationModal';
import './UnverifiedAccountModal.css';

const UnverifiedAccountModal = ({ isOpen, onClose, email }) => {
  const { sendVerificationEmail } = useAuth();
  const [resendLoading, setResendLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({ type: 'success', title: '', message: '' });

  const handleResendEmail = async () => {
    if (!email) {
      setNotificationData({
        type: 'error',
        title: 'Lỗi',
        message: 'Không tìm thấy email để gửi lại xác thực'
      });
      setShowNotification(true);
      return;
    }
    
    setResendLoading(true);
    try {
      await sendVerificationEmail(email);
      setNotificationData({
        type: 'success',
        title: 'Gửi email thành công!',
        message: 'Đã gửi lại email xác thực! Vui lòng kiểm tra hộp thư của bạn.'
      });
      setShowNotification(true);
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Gửi email thất bại';
      setNotificationData({
        type: 'error',
        title: 'Gửi email thất bại',
        message: message
      });
      setShowNotification(true);
    } finally {
      setResendLoading(false);
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
      <div className="unverified-modal-overlay" onClick={handleOverlayClick}>
        <div className="unverified-modal">
          <div className="unverified-modal-header">
            <div className="auth-logo">
              <div className="logo-icon">
                <span className="logo-cross">⚕</span>
              </div>
              <span className="logo-text">Nhà Thuốc Online</span>
            </div>
            <button className="unverified-modal-close" onClick={onClose}>
              ×
            </button>
          </div>
          
          <div className="unverified-modal-body">
            <h2 className="unverified-title">Tài khoản chưa được xác thực</h2>
            <p className="unverified-subtitle">
              Tài khoản của bạn chưa được xác thực. Vui lòng kiểm tra email để xác thực tài khoản trước khi đăng nhập.
            </p>
            
            <div className="unverified-email-info">
              <p>Email đăng nhập: <strong>{email}</strong></p>
            </div>

            <div className="unverified-actions">
              <button 
                className="btn-back-login" 
                onClick={onClose}
              >
                Quay lại đăng nhập
              </button>
              
              <div className="resend-section">
                <p className="resend-text">Chưa nhận được email xác thực?</p>
                <button 
                  className="btn-resend-verification" 
                  onClick={handleResendEmail}
                  disabled={resendLoading}
                >
                  {resendLoading ? (
                    <>
                      <span className="loading-spinner-small"></span>
                      Đang gửi...
                    </>
                  ) : (
                    'Gửi lại email xác thực'
                  )}
                </button>
              </div>
            </div>
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

export default UnverifiedAccountModal;