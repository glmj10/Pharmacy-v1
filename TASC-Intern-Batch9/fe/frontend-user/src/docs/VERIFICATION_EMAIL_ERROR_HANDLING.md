# Verification Email Error Handling

## Overview
This document describes the improved error handling for verification email functionality in the frontend user application.

## Error Types Handled

### 1. HTTP Status Code Errors

#### 400 - Bad Request
- **Already Verified**: "Tài khoản đã được xác thực rồi. Bạn có thể đăng nhập ngay bây giờ."
- **Email Not Found**: "Email không tồn tại trong hệ thống. Vui lòng kiểm tra lại email hoặc đăng ký tài khoản mới."
- **Invalid Email Format**: "Định dạng email không hợp lệ. Vui lòng nhập đúng định dạng email (ví dụ: user@example.com)."
- **Rate Limiting**: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng đợi 5 phút trước khi thử lại."

#### 404 - Not Found
- "Email không tồn tại trong hệ thống. Vui lòng kiểm tra lại email hoặc đăng ký tài khoản mới."

#### 409 - Conflict
- "Tài khoản đã được xác thực rồi. Bạn có thể đăng nhập ngay bây giờ."

#### 429 - Too Many Requests
- "Bạn đã gửi quá nhiều yêu cầu. Vui lòng đợi 5 phút trước khi thử lại."

#### 500 - Internal Server Error
- "Lỗi máy chủ. Vui lòng thử lại sau vài phút."

#### 503 - Service Unavailable
- "Dịch vụ email tạm thời không khả dụng. Vui lòng thử lại sau."

### 2. Network Errors
- **Connection Error**: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại."
- **Timeout Error**: "Yêu cầu quá thời gian chờ. Vui lòng thử lại với kết nối mạng ổn định hơn."

## Implementation

### Files Modified

1. **AuthContext.js** - Updated `sendVerificationEmail` function to use centralized error handling
2. **errorHandler.js** - Added `handleVerificationEmailError` method
3. **ResendVerificationModal.js** - Updated to use improved error messages
4. **UnverifiedAccountModal.js** - Updated to use improved error messages
5. **AuthModal.js** - Updated to use improved error messages
6. **VerifyAccount.js** - Updated to use improved error messages

### Error Handling Flow

```javascript
// In AuthContext.js
const sendVerificationEmail = async (email) => {
  try {
    const response = await authService.sendVerificationEmail(email);
    return response;
  } catch (error) {
    const errorMessage = handleVerificationEmailError(error);
    const customError = new Error(errorMessage);
    customError.originalError = error;
    customError.status = error.response?.status;
    throw customError;
  }
};
```

### Usage in Components

Components now simply catch the error and use the `error.message` property:

```javascript
try {
  await sendVerificationEmail(email);
  // Success handling
} catch (error) {
  setNotificationData({
    type: 'error',
    title: 'Gửi email thất bại',
    message: error.message // User-friendly message with suggestions
  });
}
```

## Benefits

1. **Consistent Error Messages**: All components display the same error messages for the same error types
2. **User-Friendly**: Messages are in Vietnamese and provide helpful suggestions
3. **Centralized**: All error handling logic is in one place for easy maintenance
4. **Detailed Logging**: Errors are properly logged for debugging purposes
5. **Graceful Degradation**: Network errors and unexpected errors are handled gracefully

## Testing

To test the error handling:

1. **Invalid Email**: Try sending verification email with malformed email
2. **Non-existent Email**: Try with email not in system
3. **Already Verified**: Try with already verified account
4. **Rate Limiting**: Send multiple requests quickly
5. **Network Issues**: Test with poor internet connection

## Future Improvements

1. Add retry mechanism for transient errors
2. Add progress indicators for long-running requests
3. Add email format validation on frontend
4. Implement exponential backoff for rate-limited requests