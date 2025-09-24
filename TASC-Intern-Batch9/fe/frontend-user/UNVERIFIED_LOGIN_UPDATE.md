# Cập nhật xử lý đăng nhập tài khoản chưa được xác thực

## Thay đổi mới

Đã cập nhật logic xử lý khi đăng nhập với tài khoản chưa được xác thực để hiển thị modal chuyên dụng thay vì toast error.

## Response API khi tài khoản chưa xác thực

```json
{
    "timestamp": "2025-09-24T09:48:45.8236001",
    "status": 400,
    "error": "Bad Request", 
    "message": "Tài khoản chưa được kích hoạt, vui lòng kiểm tra email để xác thực",
    "path": "/api/v1/auth/login",
    "errorCode": "VALIDATION_ERROR",
    "details": null
}
```

## Các thay đổi thực hiện

### 1. AuthContext.js
- **Sửa error handling**: Ném lại error gốc thay vì tạo Error object mới
- **Lý do**: Giữ nguyên response data để component có thể kiểm tra errorCode và status

```javascript
// TRƯỚC (mất response data)
throw new Error(error.response.data.message);

// SAU (giữ nguyên response data)  
throw error;
```

### 2. UnverifiedAccountModal Component (Mới)
- **Component riêng biệt** để xử lý trường hợp tài khoản chưa xác thực
- **Features**:
  - Hiển thị email đã đăng nhập
  - Nút "Quay lại đăng nhập" 
  - Nút "Gửi lại email xác thực" với loading state
  - Design riêng với màu sắc cảnh báo (đỏ)

### 3. AuthModal.js
- **Logic kiểm tra lỗi cải thiện**: Kiểm tra status = 400, errorCode = 'VALIDATION_ERROR'
- **Không hiển thị toast error** khi là lỗi chưa xác thực
- **Chuyển sang UnverifiedAccountModal** với email đã nhập

### 4. Login.js (Trang đăng nhập riêng)
- **Tương tự AuthModal**: Kiểm tra lỗi và hiển thị modal
- **Import UnverifiedAccountModal** và xử lý state

## Workflow mới khi đăng nhập chưa xác thực

### Trong AuthModal:
1. User nhập email/password → Submit đăng nhập
2. Backend trả về lỗi 400 với errorCode: 'VALIDATION_ERROR'
3. **KHÔNG** hiển thị toast error
4. Chuyển sang UnverifiedAccountModal với email đã nhập
5. User có thể:
   - "Quay lại đăng nhập" → Quay về form đăng nhập
   - "Gửi lại email xác thực" → Gửi email với loading state

### Trong trang Login riêng:
1. Tương tự như trên
2. Modal hiển thị overlay trên trang login
3. Sau khi xử lý xong có thể tiếp tục đăng nhập

## UI/UX Improvements

### 🎨 **Design cải thiện:**
- Màu sắc cảnh báo (đỏ) cho modal chưa xác thực
- Icon và branding nhất quán
- Loading spinner cho button gửi lại email
- Responsive design đầy đủ

### 📱 **User Experience:**
- **Không có toast error** gây nhầm lẫn
- **Thông tin rõ ràng** về tình trạng tài khoản
- **Multiple options** để xử lý (quay lại hoặc gửi lại email)
- **Email được hiển thị** để user xác nhận

### 🔄 **Error Handling:**
- Phân biệt rõ ràng lỗi xác thực vs lỗi khác
- Giữ nguyên response data từ API
- Xử lý graceful cho network errors

## Files đã thay đổi

```
src/
├── contexts/
│   └── AuthContext.js ✅ (Fixed error handling)
├── components/
│   ├── AuthModal/
│   │   └── AuthModal.js ✅ (Added unverified logic)
│   └── UnverifiedAccountModal/ 🆕
│       ├── UnverifiedAccountModal.js
│       └── UnverifiedAccountModal.css
└── pages/
    └── Auth/
        └── Login.js ✅ (Added unverified logic)
```

## Kiểm tra logic

Để test tính năng mới:

1. **Đăng ký tài khoản mới** nhưng không xác thực email
2. **Thử đăng nhập** với tài khoản đó
3. **Kiểm tra**: Không có toast error, chỉ có modal chuyên dụng
4. **Test**: Nút "Gửi lại email xác thực" hoạt động
5. **Test**: Nút "Quay lại đăng nhập" đóng modal
6. **Test**: Responsive trên mobile

## Lợi ích

- ✅ **UX sạch sẽ**: Không có toast error gây nhầm lẫn
- ✅ **Thông tin rõ ràng**: User hiểu chính xác vấn đề
- ✅ **Hành động cụ thể**: Hướng dẫn user làm gì tiếp theo  
- ✅ **Design nhất quán**: Theo design system của app
- ✅ **Error handling chuẩn**: Giữ nguyên API response data