import React, { useState } from 'react';
import {
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CSpinner,
  CAlert,
  CRow,
  CCol,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilLockLocked, cilSave, cilX } from '@coreui/icons';
import authService from '../../services/auth.service';

const ChangePasswordTab = ({ userInfo }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (message.content) {
      setMessage({ type: '', content: '' });
    }
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      setMessage({ type: 'danger', content: 'Vui lòng nhập mật khẩu hiện tại!' });
      return false;
    }

    if (!formData.newPassword) {
      setMessage({ type: 'danger', content: 'Vui lòng nhập mật khẩu mới!' });
      return false;
    }

    if (formData.newPassword.length < 6) {
      setMessage({ type: 'danger', content: 'Mật khẩu mới phải có ít nhất 6 ký tự!' });
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'danger', content: 'Mật khẩu xác nhận không khớp!' });
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      setMessage({ type: 'danger', content: 'Mật khẩu mới phải khác mật khẩu hiện tại!' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setMessage({ type: '', content: '' });

    try {
      const response = await authService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      if (response.status === 200) {
        setMessage({ 
          type: 'success', 
          content: 'Đổi mật khẩu thành công!' 
        });
        
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setMessage({ 
          type: 'danger', 
          content: response.message || 'Có lỗi xảy ra khi đổi mật khẩu!' 
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ 
        type: 'danger', 
        content: error.message || 'Có lỗi xảy ra khi đổi mật khẩu!' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setMessage({ type: '', content: '' });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: '', color: '' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength, text: 'Yếu', color: 'danger' };
    if (strength <= 4) return { strength, text: 'Trung bình', color: 'warning' };
    return { strength, text: 'Mạnh', color: 'success' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <div>
      {/* Thông báo */}
      {message.content && (
        <CAlert color={message.type} dismissible onClose={() => setMessage({ type: '', content: '' })}>
          {message.content}
        </CAlert>
      )}

      <div className="mb-4">
        <h5>Đổi mật khẩu</h5>
        <p className="text-muted">
          Để bảo mật tài khoản, vui lòng sử dụng mật khẩu mạnh và không chia sẻ với người khác.
        </p>
      </div>

      <CForm onSubmit={handleSubmit}>
        <CRow>
          <CCol md={12}>
            <div className="mb-3">
              <CFormLabel htmlFor="currentPassword">
                Mật khẩu hiện tại <span className="text-danger">*</span>
              </CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilLockLocked} />
                </CInputGroupText>
                <CFormInput
                  id="currentPassword"
                  name="currentPassword"
                  type={showPasswords.current ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  placeholder="Nhập mật khẩu hiện tại"
                  required
                />
                <CButton
                  type="button"
                  color="secondary"
                  variant="outline"
                  onClick={() => togglePasswordVisibility('current')}
                >
                  {showPasswords.current ? '🙈' : '👁️'}
                </CButton>
              </CInputGroup>
            </div>
          </CCol>

          <CCol md={12}>
            <div className="mb-3">
              <CFormLabel htmlFor="newPassword">
                Mật khẩu mới <span className="text-danger">*</span>
              </CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilLockLocked} />
                </CInputGroupText>
                <CFormInput
                  id="newPassword"
                  name="newPassword"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                  required
                />
                <CButton
                  type="button"
                  color="secondary"
                  variant="outline"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showPasswords.new ? '🙈' : '👁️'}
                </CButton>
              </CInputGroup>
              
              {/* Password strength indicator */}
              {formData.newPassword && (
                <div className="mt-2">
                  <small className={`text-${passwordStrength.color}`}>
                    Độ mạnh mật khẩu: {passwordStrength.text}
                  </small>
                  <div className="progress mt-1" style={{ height: '3px' }}>
                    <div 
                      className={`progress-bar bg-${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.strength / 6) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </CCol>

          <CCol md={12}>
            <div className="mb-3">
              <CFormLabel htmlFor="confirmPassword">
                Xác nhận mật khẩu mới <span className="text-danger">*</span>
              </CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilLockLocked} />
                </CInputGroupText>
                <CFormInput
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Nhập lại mật khẩu mới"
                  required
                />
                <CButton
                  type="button"
                  color="secondary"
                  variant="outline"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showPasswords.confirm ? '🙈' : '👁️'}
                </CButton>
              </CInputGroup>
              
              {/* Password match indicator */}
              {formData.confirmPassword && (
                <div className="mt-1">
                  {formData.newPassword === formData.confirmPassword ? (
                    <small className="text-success">✓ Mật khẩu khớp</small>
                  ) : (
                    <small className="text-danger">✗ Mật khẩu không khớp</small>
                  )}
                </div>
              )}
            </div>
          </CCol>
        </CRow>

        {/* Nút điều khiển */}
        <div className="d-flex justify-content-end gap-2">
          <CButton 
            color="secondary" 
            variant="outline"
            onClick={handleReset}
            disabled={isSaving}
          >
            <CIcon icon={cilX} className="me-2" />
            Đặt lại
          </CButton>
          <CButton 
            color="primary" 
            type="submit"
            disabled={isSaving || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
          >
            {isSaving ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Đang đổi mật khẩu...
              </>
            ) : (
              <>
                <CIcon icon={cilSave} className="me-2" />
                Đổi mật khẩu
              </>
            )}
          </CButton>
        </div>
      </CForm>

      {/* Hướng dẫn bảo mật */}
      <hr className="my-4" />
      <div className="alert alert-info">
        <h6 className="alert-heading">💡 Gợi ý tạo mật khẩu mạnh:</h6>
        <ul className="mb-0">
          <li>Sử dụng ít nhất 8 ký tự</li>
          <li>Kết hợp chữ thường, chữ hoa, số và ký tự đặc biệt</li>
          <li>Không sử dụng thông tin cá nhân (tên, ngày sinh, số điện thoại)</li>
          <li>Không sử dụng mật khẩu phổ biến như "123456", "password"</li>
          <li>Thay đổi mật khẩu định kỳ</li>
        </ul>
      </div>
    </div>
  );
};

export default ChangePasswordTab;
