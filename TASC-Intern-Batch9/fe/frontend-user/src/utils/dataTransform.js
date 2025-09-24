export const ProfileTransform = {
  toBackendRequest: (profileData) => {
    return {
      fullName: profileData.fullName,
      phoneNumber: profileData.phoneNumber, 
      address: profileData.address
    };
  },

  toFrontendFormat: (backendProfile) => {
    return {
      id: backendProfile.id,
      fullName: backendProfile.fullName,
      phoneNumber: backendProfile.phoneNumber, 
      address: backendProfile.address
    };
  },

  validateProfileForm: (profileData) => {
    const errors = [];
    const fieldErrors = {};

    // Validate fullName
    if (!profileData.fullName || profileData.fullName.trim() === '') {
      errors.push('Họ và tên không được để trống');
      fieldErrors.fullName = ['Họ và tên không được để trống'];
    } else if (profileData.fullName.trim().length < 2) {
      errors.push('Họ và tên phải có ít nhất 2 ký tự');
      fieldErrors.fullName = ['Họ và tên phải có ít nhất 2 ký tự'];
    } else if (profileData.fullName.trim().length > 100) {
      errors.push('Họ và tên không được vượt quá 100 ký tự');
      fieldErrors.fullName = ['Họ và tên không được vượt quá 100 ký tự'];
    } else if (!/^[a-zA-ZÀ-ỹĐđ\s]+$/.test(profileData.fullName.trim())) {
      errors.push('Họ và tên chỉ được chứa chữ cái và khoảng trắng');
      fieldErrors.fullName = ['Họ và tên chỉ được chứa chữ cái và khoảng trắng'];
    }

    // Validate phoneNumber
    if (!profileData.phoneNumber || profileData.phoneNumber.trim() === '') {
      errors.push('Số điện thoại không được để trống');
      fieldErrors.phoneNumber = ['Số điện thoại không được để trống'];
    } 

    // Validate address
    if (!profileData.address || profileData.address.trim() === '') {
      errors.push('Địa chỉ không được để trống');
      fieldErrors.address = ['Địa chỉ không được để trống'];
    } else if (profileData.address.trim().length < 10) {
      errors.push('Địa chỉ phải có ít nhất 10 ký tự');
      fieldErrors.address = ['Địa chỉ phải có ít nhất 10 ký tự'];
    } else if (profileData.address.trim().length > 255) {
      errors.push('Địa chỉ không được vượt quá 255 ký tự');
      fieldErrors.address = ['Địa chỉ không được vượt quá 255 ký tự'];
    }

    return {
      isValid: errors.length === 0,
      errors,
      fieldErrors
    };
  }
};

export const UserTransform = {
  validateUserInfo: (userInfo) => {
    const errors = [];
    const fieldErrors = {};

    // Validate username
    if (!userInfo.username || userInfo.username.trim() === '') {
      errors.push('Tên đăng nhập không được để trống');
      fieldErrors.username = ['Tên đăng nhập không được để trống'];
    } else if (userInfo.username.trim().length < 3) {
      errors.push('Tên đăng nhập phải có ít nhất 3 ký tự');
      fieldErrors.username = ['Tên đăng nhập phải có ít nhất 3 ký tự'];
    } else if (userInfo.username.trim().length > 50) {
      errors.push('Tên đăng nhập không được vượt quá 50 ký tự');
      fieldErrors.username = ['Tên đăng nhập không được vượt quá 50 ký tự'];
    } else if (!/^[a-zA-Z0-9_]+$/.test(userInfo.username.trim())) {
      errors.push('Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới');
      fieldErrors.username = ['Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới'];
    }

    // Validate email if provided
    if (userInfo.email && userInfo.email.trim() !== '') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email.trim())) {
        errors.push('Email không hợp lệ');
        fieldErrors.email = ['Email không hợp lệ'];
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      fieldErrors
    };
  },

  toBackendUserInfo: (userInfo) => {
    return {
      username: userInfo.username
    };
  },

  toBackendPasswordRequest: (passwordData) => {
    return {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
      confirmPassword: passwordData.confirmPassword
    };
  },

  validatePasswordForm: (passwordData) => {
    const errors = [];
    const fieldErrors = {};

    // Validate current password
    if (!passwordData.currentPassword || passwordData.currentPassword.trim() === '') {
      errors.push('Vui lòng nhập mật khẩu hiện tại');
      fieldErrors.currentPassword = ['Vui lòng nhập mật khẩu hiện tại'];
    }

    // Validate new password
    if (!passwordData.newPassword || passwordData.newPassword.trim() === '') {
      errors.push('Vui lòng nhập mật khẩu mới');
      fieldErrors.newPassword = ['Vui lòng nhập mật khẩu mới'];
    } else if (passwordData.newPassword.length < 6) {
      errors.push('Mật khẩu mới phải có ít nhất 6 ký tự');
      fieldErrors.newPassword = ['Mật khẩu mới phải có ít nhất 6 ký tự'];
    } else if (passwordData.newPassword.length > 50) {
      errors.push('Mật khẩu mới không được vượt quá 50 ký tự');
      fieldErrors.newPassword = ['Mật khẩu mới không được vượt quá 50 ký tự'];
    } 

    if (!passwordData.confirmPassword || passwordData.confirmPassword.trim() === '') {
      errors.push('Vui lòng xác nhận mật khẩu mới');
      fieldErrors.confirmPassword = ['Vui lòng xác nhận mật khẩu mới'];
    }

    if (passwordData.newPassword && passwordData.confirmPassword && 
        passwordData.newPassword !== passwordData.confirmPassword) {
      errors.push('Mật khẩu mới không khớp');
      fieldErrors.confirmPassword = ['Mật khẩu mới không khớp'];
    }

    if (passwordData.currentPassword && passwordData.newPassword && 
        passwordData.currentPassword === passwordData.newPassword) {
      errors.push('Mật khẩu mới phải khác mật khẩu hiện tại');
      fieldErrors.newPassword = ['Mật khẩu mới phải khác mật khẩu hiện tại'];
    }

    return {
      isValid: errors.length === 0,
      errors,
      fieldErrors
    };
  }
};

export const AuthTransform = {
  transformLoginResponse: (apiResponse) => {
    
    if (!apiResponse || !apiResponse.data) {
      throw new Error('Invalid login response structure');
    }

    return {
      token: apiResponse.data.token,
      message: apiResponse.message,
      status: apiResponse.status
    };
  },

  transformRegisterResponse: (apiResponse) => {

    if (!apiResponse || !apiResponse.data) {
      throw new Error('Invalid register response structure');
    }

    return {
      user: {
        id: apiResponse.data.id,
        username: apiResponse.data.username,
        email: apiResponse.data.email,
        profilePic: apiResponse.data.profilePic,
        roles: apiResponse.data.roles,
        createdAt: apiResponse.data.createdAt
      },
      message: apiResponse.message,
      status: apiResponse.status
    };
  },

  transformUserResponse: (userResponse) => {
    if (!userResponse) {
      return null;
    }

    return {
      id: userResponse.id,
      username: userResponse.username,
      email: userResponse.email,
      profilePic: userResponse.profilePic,
      roles: userResponse.roles || [],
      createdAt: userResponse.createdAt
    };
  },

  validateLoginCredentials: (credentials) => {
    const errors = [];

    if (!credentials.email || credentials.email.trim() === '') {
      errors.push('Email không được để trống');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      errors.push('Email không hợp lệ');
    }

    if (!credentials.password || credentials.password.trim() === '') {
      errors.push('Mật khẩu không được để trống');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  validateRegisterData: (userData) => {
    const errors = [];

    if (!userData.email || userData.email.trim() === '') {
      errors.push('Email không được để trống');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.push('Email không hợp lệ');
    }

    if (!userData.username || userData.username.trim() === '') {
      errors.push('Tên người dùng không được để trống');
    } else if (userData.username.length < 3) {
      errors.push('Tên người dùng phải có ít nhất 3 ký tự');
    }

    if (!userData.password || userData.password.trim() === '') {
      errors.push('Mật khẩu không được để trống');
    } else if (userData.password.length < 6) {
      errors.push('Mật khẩu phải có ít nhất 6 ký tự');
    }

    if (!userData.confirmPassword || userData.confirmPassword.trim() === '') {
      errors.push('Mật khẩu xác nhận không được để trống');
    } else if (userData.password !== userData.confirmPassword) {
      errors.push('Mật khẩu xác nhận không khớp');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  toChangePasswordRequest: (passwordData) => {
    return {
      oldPassword: passwordData.currentPassword,
      password: passwordData.newPassword,
      confirmPassword: passwordData.confirmPassword
    };
  },

  toUserInfoRequest: (userInfo) => {
    return {
      email: userInfo.email,
      username: userInfo.username
    };
  }

};

export const ErrorTransform = {
  transformValidationErrors: (error) => {
    const fieldErrors = {};
    
    if (error?.response?.data?.details && Array.isArray(error.response.data.details)) {
      error.response.data.details.forEach(detail => {
        if (detail.field && detail.message) {
          if (!fieldErrors[detail.field]) {
            fieldErrors[detail.field] = [];
          }
          fieldErrors[detail.field].push(detail.message);
        }
      });
    }
    
    return fieldErrors;
  },

  getFirstFieldError: (fieldErrors, fieldName) => {
    return fieldErrors[fieldName] && fieldErrors[fieldName].length > 0 
      ? fieldErrors[fieldName][0] 
      : null;
  },

  hasFieldError: (fieldErrors, fieldName) => {
    return fieldErrors[fieldName] && fieldErrors[fieldName].length > 0;
  },

  transformErrorMessage: (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;
    
    const fieldErrors = ErrorTransform.transformValidationErrors(error);
    const hasFieldErrors = Object.keys(fieldErrors).length > 0;
    
    if (hasFieldErrors) {
      return 'Vui lòng kiểm tra lại thông tin đã nhập';
    }
    
    if (message) {
      return message;
    }
    
    switch (status) {
      case 400:
        return 'Dữ liệu không hợp lệ';
      case 401:
        return 'Thông tin đăng nhập không chính xác';
      case 403:
        return 'Bạn không có quyền thực hiện thao tác này';
      case 404:
        return 'Không tìm thấy thông tin yêu cầu';
      case 409:
        return 'Dữ liệu đã tồn tại trong hệ thống';
      case 422:
        return 'Dữ liệu không hợp lệ';
      case 500:
        return 'Lỗi hệ thống. Vui lòng thử lại sau';
      default:
        return 'Đã xảy ra lỗi không xác định';
    }
  }
};

export default { ProfileTransform, UserTransform, AuthTransform, ErrorTransform };
