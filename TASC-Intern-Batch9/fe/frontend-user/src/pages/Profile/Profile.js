import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { profileService } from '../../services/profileService';
import { userService } from '../../services/userService';
import { ProfileTransform, UserTransform, ErrorTransform } from '../../utils/dataTransform';
import { toast } from 'react-toastify';
import { 
  FaUser, 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaSave, 
  FaTimes, 
  FaCamera,
  FaLock,
  FaMapMarkerAlt,
  FaPhone
} from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
  const { user, updateUser, updateUserLocal } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [profilePicLoading, setProfilePicLoading] = useState(false);
  const [profilePicTimestamp, setProfilePicTimestamp] = useState(null);
  const fileInputRef = useRef(null);

  const [personalInfo, setPersonalInfo] = useState({
    username: '',
    email: '',
    profilePic: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [profiles, setProfiles] = useState([]);
  const [editingProfile, setEditingProfile] = useState(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phoneNumber: '',
    address: ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [profileErrors, setProfileErrors] = useState({});

  const clearFieldError = (fieldName, errorType = 'validationErrors') => {
    const setErrorState = {
      validationErrors: setValidationErrors,
      passwordErrors: setPasswordErrors,
      profileErrors: setProfileErrors
    }[errorType];

    if (setErrorState) {
      setErrorState(prev => ({
        ...prev,
        [fieldName]: undefined
      }));
    }
  };

  useEffect(() => {
    if (user) {
      setPersonalInfo({
        username: user.username || '',
        email: user.email || '',
        profilePic: user.profilePic || ''
      });
    }
  }, [user]);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const response = await profileService.getUserProfiles();
      if (response?.data) {
        setProfiles(response.data);
      } else if (Array.isArray(response)) {
        setProfiles(response);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdatePersonalInfo = async () => {
    // Clear previous errors
    setValidationErrors({});
    
    // Validate user info
    const validation = UserTransform.validateUserInfo(personalInfo);
    
    if (!validation.isValid) {
      setValidationErrors(validation.fieldErrors);
      validation.errors.forEach(error => toast.error(error));
      return;
    }

    try {
      setLoading(true);
      
      // Call updateUser from context directly instead of userService
      const response = await updateUser({ 
        username: personalInfo.username.trim(),
        email: personalInfo.email
      });
      
      if (response?.data) {
        toast.success('Cập nhật thông tin thành công!');
      }
    } catch (error) {
      console.error('Error updating personal info:', error);
      
      const fieldErrors = ErrorTransform.transformValidationErrors(error);
      
      if (Object.keys(fieldErrors).length > 0) {
        setValidationErrors(fieldErrors);
        toast.error('Vui lòng kiểm tra lại thông tin đã nhập');
      } else {
        const errorMessage = ErrorTransform.transformErrorMessage(error);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File không được lớn hơn 5MB');
      return;
    }

    try {
      setProfilePicLoading(true);
      
      const response = await userService.updateProfilePicture(file);
      
      if (response?.data) {
        const newProfilePic = response.data.profilePicUrl || response.data.profilePic || response.data.profilePicture || response.data;
        
        setPersonalInfo(prev => ({
          ...prev,
          profilePic: newProfilePic
        }));
        
        setProfilePicTimestamp(Date.now());
        
        const updatedUser = {
          ...user,
          profilePic: newProfilePic
        };
        
        updateUserLocal(updatedUser);
        
        toast.success('Cập nhật ảnh đại diện thành công!');
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật ảnh đại diện';
      toast.error(errorMessage);
      console.error('Error updating profile picture:', error);
    } finally {
      setProfilePicLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Real-time validation
    if (value.trim() !== '') {
      const tempData = { ...passwordData, [name]: value };
      const validation = UserTransform.validatePasswordForm(tempData);
      
      if (validation.fieldErrors[name]) {
        setPasswordErrors(prev => ({
          ...prev,
          [name]: validation.fieldErrors[name]
        }));
      } else {
        setPasswordErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  const handleUpdatePassword = async () => {
    // Clear previous errors
    setPasswordErrors({});
    
    const validation = UserTransform.validatePasswordForm(passwordData);
    
    if (!validation.isValid) {
      setPasswordErrors(validation.fieldErrors);
      validation.errors.forEach(error => toast.error(error));
      return;
    }

    try {
      setLoading(true);
      await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast.success('Đổi mật khẩu thành công!');
    } catch (error) {
      console.error('Error changing password:', error);
      
      const fieldErrors = ErrorTransform.transformValidationErrors(error);
      
      if (Object.keys(fieldErrors).length > 0) {
        setPasswordErrors(fieldErrors);
        toast.error('Vui lòng kiểm tra lại thông tin đã nhập');
      } else {
        const errorMessage = ErrorTransform.transformErrorMessage(error);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Real-time validation
    if (value.trim() !== '') {
      const tempForm = { ...profileForm, [name]: value };
      const validation = ProfileTransform.validateProfileForm(tempForm);
      
      if (validation.fieldErrors[name]) {
        setProfileErrors(prev => ({
          ...prev,
          [name]: validation.fieldErrors[name]
        }));
      } else {
        setProfileErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  const handleAddProfile = () => {
    setProfileForm({
      fullName: '',
      phoneNumber: '',
      address: ''
    });
    setEditingProfile(null);
    setProfileErrors({});
    setShowProfileForm(true);
  };

  const handleEditProfile = (profile) => {
    setProfileForm({
      fullName: profile.fullName || '',
      phoneNumber: profile.phoneNumber || '',
      address: profile.address || ''
    });
    setEditingProfile(profile);
    setProfileErrors({});
    setShowProfileForm(true);
  };

  const handleSaveProfile = async () => {
    // Clear previous errors
    setProfileErrors({});
    
    const validation = ProfileTransform.validateProfileForm(profileForm);
    
    if (!validation.isValid) {
      setProfileErrors(validation.fieldErrors);
      validation.errors.forEach(error => toast.error(error));
      return;
    }

    try {
      setLoading(true);
      
      if (editingProfile) {
        const response = await profileService.updateProfile(editingProfile.id, profileForm);
        if (response?.data || response?.status === 200) {
          toast.success('Cập nhật địa chỉ thành công!');
        }
      } else {
        const response = await profileService.createProfile(profileForm);
        if (response?.data || response?.status === 201) {
          toast.success('Thêm địa chỉ mới thành công!');
        }
      }
      
      await fetchProfiles();
      setShowProfileForm(false);
      setProfileForm({
        fullName: '',
        phoneNumber: '',
        address: ''
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      
      const fieldErrors = ErrorTransform.transformValidationErrors(error);
      
      if (Object.keys(fieldErrors).length > 0) {
        setProfileErrors(fieldErrors);
        toast.error('Vui lòng kiểm tra lại thông tin đã nhập');
      } else {
        const errorMessage = ErrorTransform.transformErrorMessage(error);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async (profileId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await profileService.deleteProfile(profileId);
      if (response?.status === 200 || response) {
        await fetchProfiles();
        toast.success('Xóa địa chỉ thành công!');
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Thông tin cá nhân', icon: FaUser },
    { id: 'addresses', label: 'Địa chỉ giao hàng', icon: FaMapMarkerAlt },
    { id: 'password', label: 'Đổi mật khẩu', icon: FaLock }
  ];

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <h1>Tài khoản của tôi</h1>
          <p>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
        </div>

        <div className="profile-content">
          {/* Sidebar */}
          <div className="profile-sidebar">
            <div className="user-avatar">
              <div className="avatar-container">
                <img 
                  src={personalInfo.profilePic 
                    ? `${personalInfo.profilePic}${profilePicTimestamp ? `?t=${profilePicTimestamp}` : ''}` 
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(personalInfo.username || 'User')}&background=667eea&color=fff&size=120`
                  } 
                  alt="Avatar"
                  className="avatar-img"
                />
                <button 
                  className="avatar-edit-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={profilePicLoading}
                >
                  <FaCamera />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicChange}
                  style={{ display: 'none' }}
                />
              </div>
              <div className="user-info">
                <h3>{personalInfo.username || 'Người dùng'}</h3>
                <p>{personalInfo.email}</p>
              </div>
            </div>

            <nav className="profile-nav">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.icon />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="profile-main">
            {activeTab === 'personal' && (
              <div className="tab-content">
                <div className="tab-header">
                  <h2>Thông tin cá nhân</h2>
                  <p>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
                </div>

                <div className="form-group">
                  <label>Tên đăng nhập</label>
                  <input
                    type="text"
                    name="username"
                    value={personalInfo.username}
                    onChange={(e) => {
                      handlePersonalInfoChange(e);
                      clearFieldError('username');
                    }}
                    placeholder="Nhập tên đăng nhập"
                    minLength="3"
                    className={ErrorTransform.hasFieldError(validationErrors, 'username') ? 'error' : ''}
                    required
                  />
                  {ErrorTransform.hasFieldError(validationErrors, 'username') ? (
                    <div className="error-message">
                      {ErrorTransform.getFirstFieldError(validationErrors, 'username')}
                    </div>
                  ) : (
                    <small>Tên đăng nhập phải có ít nhất 3 ký tự</small>
                  )}
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={personalInfo.email}
                    disabled
                    className="disabled"
                  />
                  <small>Email không thể thay đổi</small>
                </div>

                <button 
                  className="btn btn-primary"
                  onClick={handleUpdatePersonalInfo}
                  disabled={loading}
                >
                  {loading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                </button>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="tab-content">
                <div className="tab-header">
                  <h2>Địa chỉ giao hàng</h2>
                  <button 
                    className="btn btn-primary"
                    onClick={handleAddProfile}
                  >
                    <FaPlus /> Thêm địa chỉ mới
                  </button>
                </div>

                {showProfileForm && (
                  <div className="profile-form">
                    <h3>{editingProfile ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}</h3>
                    
                    <div className="form-group">
                      <label>Họ và tên *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={profileForm.fullName}
                        onChange={(e) => {
                          handleProfileFormChange(e);
                          clearFieldError('fullName', 'profileErrors');
                        }}
                        placeholder="Nhập họ và tên"
                        className={ErrorTransform.hasFieldError(profileErrors, 'fullName') ? 'error' : ''}
                        required
                      />
                      {ErrorTransform.hasFieldError(profileErrors, 'fullName') && (
                        <div className="error-message">
                          {ErrorTransform.getFirstFieldError(profileErrors, 'fullName')}
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Số điện thoại *</label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={profileForm.phoneNumber}
                        onChange={(e) => {
                          handleProfileFormChange(e);
                          clearFieldError('phoneNumber', 'profileErrors');
                        }}
                        placeholder="Nhập số điện thoại (VD: 0901234567)"
                        className={ErrorTransform.hasFieldError(profileErrors, 'phoneNumber') ? 'error' : ''}
                        required
                      />
                      {ErrorTransform.hasFieldError(profileErrors, 'phoneNumber') && (
                        <div className="error-message">
                          {ErrorTransform.getFirstFieldError(profileErrors, 'phoneNumber')}
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Địa chỉ *</label>
                      <textarea
                        name="address"
                        value={profileForm.address}
                        onChange={(e) => {
                          handleProfileFormChange(e);
                          clearFieldError('address', 'profileErrors');
                        }}
                        placeholder="Nhập địa chỉ chi tiết (ít nhất 10 ký tự)"
                        rows="3"
                        className={ErrorTransform.hasFieldError(profileErrors, 'address') ? 'error' : ''}
                        required
                      />
                      {ErrorTransform.hasFieldError(profileErrors, 'address') && (
                        <div className="error-message">
                          {ErrorTransform.getFirstFieldError(profileErrors, 'address')}
                        </div>
                      )}
                    </div>

                    <div className="form-actions">
                      <button 
                        className="btn btn-primary"
                        onClick={handleSaveProfile}
                        disabled={loading}
                      >
                        <FaSave /> {loading ? 'Đang lưu...' : 'Lưu'}
                      </button>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowProfileForm(false);
                          setProfileErrors({});
                          setProfileForm({
                            fullName: '',
                            phoneNumber: '',
                            address: ''
                          });
                        }}
                      >
                        <FaTimes /> Hủy
                      </button>
                    </div>
                  </div>
                )}

                <div className="profiles-list">
                  {profiles.length === 0 ? (
                    <div className="empty-state">
                      <FaMapMarkerAlt />
                      <h3>Chưa có địa chỉ giao hàng</h3>
                      <p>Thêm địa chỉ giao hàng để dễ dàng đặt hàng</p>
                    </div>
                  ) : (
                    profiles.map(profile => (
                      <div key={profile.id} className="profile-card">
                        <div className="profile-info">
                          <h4>{profile.fullName}</h4>
                          <p><FaPhone /> {profile.phoneNumber}</p>
                          <p><FaMapMarkerAlt /> {profile.address}</p>
                        </div>
                        <div className="profile-actions">
                          <button 
                            className="btn btn-outline"
                            onClick={() => handleEditProfile(profile)}
                          >
                            <FaEdit /> Sửa
                          </button>
                          <button 
                            className="btn btn-danger"
                            onClick={() => handleDeleteProfile(profile.id)}
                          >
                            <FaTrash /> Xóa
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="tab-content">
                <div className="tab-header">
                  <h2>Đổi mật khẩu</h2>
                  <p>Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác</p>
                </div>

                <div className="form-group">
                  <label>Mật khẩu hiện tại *</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={(e) => {
                      handlePasswordChange(e);
                      clearFieldError('currentPassword', 'passwordErrors');
                    }}
                    placeholder="Nhập mật khẩu hiện tại"
                    className={ErrorTransform.hasFieldError(passwordErrors, 'currentPassword') ? 'error' : ''}
                    required
                  />
                  {ErrorTransform.hasFieldError(passwordErrors, 'currentPassword') && (
                    <div className="error-message">
                      {ErrorTransform.getFirstFieldError(passwordErrors, 'currentPassword')}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Mật khẩu mới *</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={(e) => {
                      handlePasswordChange(e);
                      clearFieldError('newPassword', 'passwordErrors');
                    }}
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự, chứa chữ và số)"
                    minLength="6"
                    className={ErrorTransform.hasFieldError(passwordErrors, 'newPassword') ? 'error' : ''}
                    required
                  />
                  {ErrorTransform.hasFieldError(passwordErrors, 'newPassword') && (
                    <div className="error-message">
                      {ErrorTransform.getFirstFieldError(passwordErrors, 'newPassword')}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Xác nhận mật khẩu mới *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={(e) => {
                      handlePasswordChange(e);
                      clearFieldError('confirmPassword', 'passwordErrors');
                    }}
                    placeholder="Nhập lại mật khẩu mới"
                    minLength="6"
                    className={ErrorTransform.hasFieldError(passwordErrors, 'confirmPassword') ? 'error' : ''}
                    required
                  />
                  {ErrorTransform.hasFieldError(passwordErrors, 'confirmPassword') && (
                    <div className="error-message">
                      {ErrorTransform.getFirstFieldError(passwordErrors, 'confirmPassword')}
                    </div>
                  )}
                </div>

                <button 
                  className="btn btn-primary"
                  onClick={handleUpdatePassword}
                  disabled={loading}
                >
                  {loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
