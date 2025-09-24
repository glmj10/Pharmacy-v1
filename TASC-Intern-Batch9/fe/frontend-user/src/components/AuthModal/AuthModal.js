import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthModal } from '../../contexts/AuthModalContext';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import ResendVerificationModal from '../ResendVerificationModal/ResendVerificationModal';
import UnverifiedAccountModal from '../UnverifiedAccountModal/UnverifiedAccountModal';
import NotificationModal from '../NotificationModal/NotificationModal';
import './AuthModal.css';

const AuthModal = () => {
  const { isOpen, modalType, closeModal, handleAuthSuccess, setModalType, openModal } = useAuthModal();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { login, register, forgotPassword, resetPassword, verifyAccount, sendVerificationEmail } = useAuth();

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [emailSentNotice, setEmailSentNotice] = useState(false);

  const [resetPasswordMode, setResetPasswordMode] = useState(false);
  const [resetData, setResetData] = useState({ password: '', confirmPassword: '', token: '' });
  const [resetLoading, setResetLoading] = useState(false);

  // Thêm các states cho verify account và modal thông báo đăng ký thành công
  const [verifyAccountMode, setVerifyAccountMode] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [registerSuccessNotice, setRegisterSuccessNotice] = useState(false);
  const [resendEmailLoading, setResendEmailLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [showResendModal, setShowResendModal] = useState(false);
  const [unverifiedAccountNotice, setUnverifiedAccountNotice] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({
    type: 'success',
    title: '',
    message: ''
  });

  const handleVerifyAccount = async (token) => {
    setVerifyLoading(true);
    try {
      await verifyAccount(token);
      setNotificationData({
        type: 'success',
        title: 'Xác thực thành công!',
        message: 'Xác thực tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.'
      });
      setShowNotification(true);
      setVerifyAccountMode(false);
      removeTokenParam();
    } catch (error) {
      const message = error?.response?.data?.message || error.message || 'Xác thực tài khoản thất bại';
      setNotificationData({
        type: 'error',
        title: 'Xác thực thất bại',
        message: message
      });
      setShowNotification(true);
      setVerifyAccountMode(false);
      removeTokenParam();
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendVerificationEmail = async () => {
    if (!registeredEmail) {
      setNotificationData({
        type: 'error',
        title: 'Lỗi',
        message: 'Không tìm thấy email để gửi lại xác thực'
      });
      setShowNotification(true);
      return;
    }
    
    setResendEmailLoading(true);
    try {
      await sendVerificationEmail(registeredEmail);
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
      setResendEmailLoading(false);
    }
  };

  const removeTokenParam = () => {
    const params = new URLSearchParams(location.search);
    if (params.has('token')) {
      params.delete('token');
    }
    if (params.has('resetPassword')) {
      params.delete('resetPassword');
    }
    if (params.has('verifyAccount')) {
      params.delete('verifyAccount');
    }
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const hasResetPassword = params.has('resetPassword');
    const hasVerifyAccount = params.has('verifyAccount');
    const token = params.get('token');
    
    if (token) {
      if (hasVerifyAccount) {
        // Token dành cho verify account
        setVerifyAccountMode(true);
        setResetPasswordMode(false);
        setForgotPasswordMode(false);
        setModalType && setModalType('login');
        handleVerifyAccount(token);
        openModal && openModal();
      } else if (hasResetPassword) {
        // Token dành cho reset password
        setResetPasswordMode(true);
        setVerifyAccountMode(false);
        setForgotPasswordMode(false);
        setModalType && setModalType('login');
        setResetData((prev) => ({ ...prev, token }));
        openModal && openModal();
      }
    } else if (hasResetPassword) {
      setResetPasswordMode(true);
      setVerifyAccountMode(false);
      setForgotPasswordMode(false);
      setModalType && setModalType('login');
      openModal && openModal();
    }
  }, [location.search, openModal]);

  useEffect(() => {
    if (!isOpen) {
      setLoginData({ email: '', password: '' });
      setRegisterData({ email: '', username: '', password: '', confirmPassword: '' });
      setForgotEmail("");
      setLoading(false);
      setForgotPasswordMode(false);
      setResetPasswordMode(false);
      setVerifyAccountMode(false);
      setResetData({ oldPassword: '', password: '', confirmPassword: '' });
      setRegisterSuccessNotice(false);
      setRegisteredEmail('');
      setResendEmailLoading(false);
      setShowResendModal(false);
      setUnverifiedAccountNotice(false);
      setUnverifiedEmail('');
    }
  }, [isOpen]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(loginData);
      toast.success('Đăng nhập thành công!');
      handleAuthSuccess();
    } catch (error) {
      // Kiểm tra nếu lỗi là tài khoản chưa được xác thực
      if (error?.response?.status === 400 && 
          error?.response?.data?.errorCode === 'VALIDATION_ERROR' &&
          error?.response?.data?.message?.includes('chưa được kích hoạt')) {
        
        // Lưu email từ form login để có thể gửi lại email xác thực
        setUnverifiedEmail(loginData.email);
        setUnverifiedAccountNotice(true);
        // KHÔNG hiển thị toast error, chỉ chuyển sang modal
      } else {
        // Xử lý các lỗi khác
        const errorMessage = error?.response?.data?.message || error?.message || 'Đăng nhập thất bại';
        toast.error('Đăng nhập thất bại: ' + errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    if (registerData.username.length < 3) {
      toast.error('Tên đăng nhập phải có ít nhất 3 ký tự!');
      return;
    }
    
    if (registerData.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Registering with data:', registerData);
      await register(registerData);
      // Lưu email để có thể gửi lại email xác thực
      setRegisteredEmail(registerData.email);
      // Hiển thị modal thông báo đăng ký thành công thay vì đóng modal
      setRegisterSuccessNotice(true);
    } catch (error) {
      toast.error('Đăng ký thất bại: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Email không được để trống!');
      return;
    }
    setForgotLoading(true);
    try {
      await forgotPassword({ email: forgotEmail, isUser: true });
      setEmailSentNotice(true);
      setForgotPasswordMode(false);
      setForgotEmail("");
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || "Lỗi không xác định";
      toast.error("Không thể gửi email: " + msg);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetData.password || resetData.password.length < 6) {
      toast.error('Mật khẩu mới phải có độ dài từ 6 ký tự!');
      return;
    }
    if (!resetData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không được để trống!');
      return;
    }
    if (resetData.password !== resetData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }
    setResetLoading(true);
    try {
      await resetPassword(resetData);
      toast.success('Đổi mật khẩu thành công!');
      setResetPasswordMode(false);
      setResetData({ password: '', confirmPassword: '', token: '' });
    } catch (error) {
      toast.error('Đổi mật khẩu thất bại: ' + (error.response.data.message || 'Lỗi không xác định'));
    } finally {
      setResetLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      removeTokenParam();
      closeModal();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={handleOverlayClick}>
      <div className="auth-modal">
        {registerSuccessNotice ? (
          <div className="auth-modal-body">
            <h2 className="auth-title">Đăng ký thành công!</h2>
            <p className="auth-subtitle">Vui lòng kiểm tra email để xác thực tài khoản trước khi đăng nhập.</p>
            <div className="auth-form" style={{ gap: '1rem' }}>
              <button className="auth-submit-btn" onClick={() => {
                setRegisterSuccessNotice(false);
                setModalType('login');
              }}>Đăng nhập ngay</button>
              
              <div className="resend-email-section" style={{ textAlign: 'center', marginTop: '1rem' }}>
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>
                  Chưa nhận được email?
                </p>
                <button 
                  type="button"
                  className="resend-email-btn" 
                  onClick={handleResendVerificationEmail}
                  disabled={resendEmailLoading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#16a34a',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f0fdf4'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  {resendEmailLoading ? 'Đang gửi...' : 'Gửi lại email xác thực'}
                </button>
              </div>
            </div>
          </div>
        ) : emailSentNotice ? (
          <div className="auth-modal-body">
            <h2 className="auth-title">Đã gửi email xác nhận</h2>
            <p className="auth-subtitle">Vui lòng kiểm tra email để xác thực tài khoản hoặc đặt lại mật khẩu.</p>
            <button className="auth-submit-btn" onClick={() => setEmailSentNotice(false)}>Đóng</button>
          </div>
        ) : verifyAccountMode ? (
          <div className="auth-modal-body">
            <h2 className="auth-title">Đang xác thực tài khoản...</h2>
            <p className="auth-subtitle">
              {verifyLoading ? 'Vui lòng chờ trong giây lát...' : 'Xác thực tài khoản hoàn tất.'}
            </p>
            {verifyLoading && (
              <div className="loading-spinner" style={{ margin: '20px auto', width: '40px', height: '40px' }}>
                <div className="spinner"></div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="auth-modal-header">
              <div className="auth-logo">
                <div className="logo-icon">
                  <span className="logo-cross">⚕</span>
                </div>
                <span className="logo-text">Nhà Thuốc Online</span>
              </div>
              <button className="close-btn" onClick={() => {
                if (resetPasswordMode || verifyAccountMode) removeTokenParam();
                closeModal();
              }}>
                ×
              </button>
              <h2 className="auth-title">
                {resetPasswordMode
                  ? 'Đổi mật khẩu'
                  : forgotPasswordMode
                    ? 'Quên mật khẩu'
                    : modalType === 'login' ? 'Đăng nhập' : 'Đăng ký tài khoản'}
              </h2>
              <p className="auth-subtitle">
                {resetPasswordMode
                  ? 'Vui lòng nhập đầy đủ thông tin để đổi mật khẩu.'
                  : forgotPasswordMode
                    ? 'Nhập email để nhận hướng dẫn đặt lại mật khẩu.'
                    : modalType === 'login' 
                      ? 'Chào mừng bạn quay trở lại!' 
                      : 'Tạo tài khoản để trải nghiệm dịch vụ tốt nhất'}
              </p>
            </div>
            <div className="auth-modal-body">
              {resetPasswordMode ? (
                <form onSubmit={handleResetPassword} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="password">Mật khẩu mới</label>
                    <input
                      type="password"
                      id="password"
                      value={resetData.password}
                      onChange={e => setResetData({ ...resetData, password: e.target.value })}
                      required
                      placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                      minLength="6"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={resetData.confirmPassword}
                      onChange={e => setResetData({ ...resetData, confirmPassword: e.target.value })}
                      required
                      placeholder="Nhập lại mật khẩu mới"
                    />
                  </div>
                  <div className="form-options" style={{ justifyContent: 'space-between' }}>
                    <button type="button" className="back-to-login" onClick={() => {
                      setResetPasswordMode(false);
                      removeTokenParam();
                    }}>
                      Quay lại đăng nhập
                    </button>
                  </div>
                  <button type="submit" className="auth-submit-btn" disabled={resetLoading}>
                    {resetLoading ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
                  </button>
                </form>
              ) : forgotPasswordMode ? (
                <form onSubmit={handleForgotPassword} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="forgot-email">Email</label>
                    <input
                      type="email"
                      id="forgot-email"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      required
                      placeholder="Nhập email của bạn"
                    />
                  </div>
                  <div className="form-options" style={{ justifyContent: 'space-between' }}>
                    <button type="button" className="back-to-login" onClick={() => setForgotPasswordMode(false)}>
                      Quay lại đăng nhập
                    </button>
                  </div>
                  <button type="submit" className="auth-submit-btn" disabled={forgotLoading}>
                    {forgotLoading ? 'Đang gửi...' : 'Gửi hướng dẫn'}
                  </button>
                </form>
              ) : (
                <>
                  <div className="auth-tabs">
                    <button 
                      className={`auth-tab ${modalType === 'login' ? 'active' : ''}`}
                      onClick={() => setModalType('login')}
                    >
                      Đăng nhập
                    </button>
                    <button 
                      className={`auth-tab ${modalType === 'register' ? 'active' : ''}`}
                      onClick={() => setModalType('register')}
                    >
                      Đăng ký
                    </button>
                  </div>
                  {modalType === 'login' ? (
                    <form onSubmit={handleLoginSubmit} className="auth-form">
                      <div className="form-group">
                        <label htmlFor="login-email">Email</label>
                        <input
                          type="email"
                          id="login-email"
                          value={loginData.email}
                          onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                          required
                          placeholder="Nhập email của bạn"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="password">Mật khẩu</label>
                        <input
                          type="password"
                          id="password"
                          value={loginData.password}
                          onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                          required
                          placeholder="Nhập mật khẩu"
                        />
                      </div>
                      <div className="form-options">
                        <label className="remember-me">
                          <input type="checkbox" />
                          <span>Ghi nhớ đăng nhập</span>
                        </label>
                        <button type="button" className="forgot-password" onClick={() => setForgotPasswordMode(true)}>
                          Quên mật khẩu?
                        </button>
                      </div>
                      <button type="submit" className="auth-submit-btn" disabled={loading}>
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                      </button>
                      
                      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <button 
                          type="button"
                          onClick={() => setShowResendModal(true)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#16a34a',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            padding: '0.5rem'
                          }}
                        >
                          Chưa nhận được email xác thực?
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleRegisterSubmit} className="auth-form">
                      <div className="form-group">
                        <label htmlFor="username">Tên đăng nhập</label>
                        <input
                          type="text"
                          id="username"
                          value={registerData.username}
                          onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                          required
                          placeholder="Nhập tên đăng nhập (ít nhất 3 ký tự)"
                          minLength="3"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="register-email">Email</label>
                        <input
                          type="email"
                          id="register-email"
                          value={registerData.email}
                          onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                          required
                          placeholder="Nhập email của bạn"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="password">Mật khẩu</label>
                        <input
                          type="password"
                          id="password"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                          required
                          placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                          minLength="6"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                        <input
                          type="password"
                          id="confirmPassword"
                          value={registerData.confirmPassword}
                          onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                          required
                          placeholder="Nhập lại mật khẩu"
                        />
                      </div>
                      <div className="form-options">
                        <label className="terms-agree">
                          <input type="checkbox" required />
                          <span>Tôi đồng ý với <a href="/terms">Điều khoản dịch vụ</a> và <a href="/privacy">Chính sách bảo mật</a></span>
                        </label>
                      </div>
                      <button type="submit" className="auth-submit-btn" disabled={loading}>
                        {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
      
      <ResendVerificationModal 
        isOpen={showResendModal} 
        onClose={() => setShowResendModal(false)} 
      />
      
      <UnverifiedAccountModal 
        isOpen={unverifiedAccountNotice} 
        onClose={() => setUnverifiedAccountNotice(false)}
        email={unverifiedEmail}
      />

      {showNotification && (
        <NotificationModal
          type={notificationData.type}
          title={notificationData.title}
          message={notificationData.message}
          onClose={() => setShowNotification(false)}
        />
      )}
    </div>
  );
};

export default AuthModal;
