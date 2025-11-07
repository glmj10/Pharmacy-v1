import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useVerificationEmail } from '../../hooks/useVerificationEmail';
import NotificationModal from '../NotificationModal/NotificationModal';
import './ResendVerificationModal.css';

const ResendVerificationModalEnhanced = ({ isOpen, onClose }) => {
  const { sendVerificationEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({
    type: 'success',
    title: '',
    message: ''
  });

  const {
    loading,
    error,
    success,
    retryCount,
    sendEmail,
    retry,
    reset
  } = useVerificationEmail(sendVerificationEmail);

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

    const result = await sendEmail(email);
    
    if (result.success) {
      setNotificationData({
        type: 'success',
        title: 'Gửi email thành công!',
        message: 'Đã gửi lại email xác thực! Vui lòng kiểm tra hộp thư của bạn.'
      });
      setShowNotification(true);
      setEmail('');
    } else {
      setNotificationData({
        type: 'error',
        title: 'Gửi email thất bại',
        message: error?.message || 'Gửi email thất bại'
      });
      setShowNotification(true);
    }
  };

  const handleRetry = () => {
    if (email && error?.canRetry) {
      retry(email);
    }
  };

  const handleClose = () => {
    reset();
    setEmail('');
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="resend-modal-overlay" onClick={handleOverlayClick}>
        <div className="resend-modal">
          <div className="resend-modal-header">
            <h2 className="resend-modal-title">Gửi lại email xác thực</h2>
            <button className="resend-modal-close" onClick={handleClose}>
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
              
              {/* Show error message with retry option */}
              {error && (
                <div className="error-container">
                  <div className="error-message">
                    {error.message}
                  </div>
                  {error.canRetry && (
                    <button 
                      type="button" 
                      className="btn-retry" 
                      onClick={handleRetry}
                      disabled={loading}
                    >
                      Thử lại
                    </button>
                  )}
                  {retryCount > 0 && (
                    <div className="retry-info">
                      Đã thử lại {retryCount} lần
                    </div>
                  )}
                </div>
              )}

              {/* Show success message */}
              {success && (
                <div className="success-message">
                  Email xác thực đã được gửi thành công!
                </div>
              )}

              <div className="resend-modal-actions">
                <button type="button" className="btn-cancel" onClick={handleClose}>
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn-submit" 
                  disabled={loading || (error && !error.canRetry)}
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      {retryCount > 0 ? 'Đang thử lại...' : 'Đang gửi...'}
                    </>
                  ) : (
                    'Gửi lại email'
                  )}
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

export default ResendVerificationModalEnhanced;