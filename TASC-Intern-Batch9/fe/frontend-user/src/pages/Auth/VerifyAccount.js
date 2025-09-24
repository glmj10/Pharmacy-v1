import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationModal from '../../components/NotificationModal/NotificationModal';
import './Auth.css';

const VerifyAccount = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyAccount, sendVerificationEmail } = useAuth();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({
    type: 'success',
    title: '',
    message: ''
  });

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setError('Token xác thực không hợp lệ');
      setLoading(false);
      return;
    }

    const handleVerifyAccount = async () => {
      try {
        setLoading(true);
        await verifyAccount(token);
        setSuccess(true);
        setNotificationData({
          type: 'success',
          title: 'Xác thực thành công!',
          message: 'Xác thực tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.'
        });
        setShowNotification(true);
      } catch (error) {
        const message = error?.response?.data?.message || error.message || 'Xác thực tài khoản thất bại';
        setError(message);
        setNotificationData({
          type: 'error',
          title: 'Xác thực thất bại',
          message: message
        });
        setShowNotification(true);
      } finally {
        setLoading(false);
      }
    };

    handleVerifyAccount();
  }, [searchParams, verifyAccount]);

  const handleGoToLogin = () => {
    navigate('/', { state: { openLoginModal: true } });
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleResendEmail = async () => {
    const email = prompt('Vui lòng nhập email của bạn để gửi lại email xác thực:');
    if (!email) return;
    
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

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-wrapper">
          <div className="auth-content">
            <div className="auth-form-section">
              <div className="auth-form-container">
                <div className="auth-header">
                  <div className="auth-logo">
                    <div className="logo-icon">
                      <span className="logo-cross">⚕</span>
                    </div>
                    <span className="logo-text">Nhà Thuốc Online</span>
                  </div>
                  <h1 className="auth-title">Đang xác thực tài khoản...</h1>
                  <p className="auth-subtitle">Vui lòng chờ trong giây lát</p>
                </div>
                <div className="loading-spinner" style={{ margin: '2rem auto' }}>
                  <div className="spinner"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="auth-container">
        <div className="auth-wrapper">
          <div className="auth-content">
            <div className="auth-form-section">
              <div className="auth-form-container">
                <div className="auth-header">
                  <div className="auth-logo">
                    <div className="logo-icon">
                      <span className="logo-cross">⚕</span>
                    </div>
                    <span className="logo-text">Nhà Thuốc Online</span>
                  </div>
                  {success ? (
                    <>
                      <h1 className="auth-title">Xác thực tài khoản thành công!</h1>
                      <p className="auth-subtitle">
                        Tài khoản của bạn đã được xác thực thành công. Bạn có thể đăng nhập ngay bây giờ.
                      </p>
                    </>
                  ) : (
                    <>
                      <h1 className="auth-title">Xác thực tài khoản thất bại</h1>
                      <p className="auth-subtitle">
                        {error || 'Đã có lỗi xảy ra trong quá trình xác thực tài khoản.'}
                      </p>
                    </>
                  )}
                </div>
                <div className="auth-actions">
                  {success ? (
                    <button onClick={handleGoToLogin} className="auth-submit-btn">
                      Đăng nhập ngay
                    </button>
                  ) : (
                    <>
                      <button onClick={handleGoHome} className="auth-submit-btn">
                        Quay lại trang chủ
                      </button>
                      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <button 
                          onClick={handleResendEmail}
                          disabled={resendLoading}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#16a34a',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            padding: '0.5rem'
                          }}
                        >
                          {resendLoading ? 'Đang gửi...' : 'Gửi lại email xác thực'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
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

export default VerifyAccount;