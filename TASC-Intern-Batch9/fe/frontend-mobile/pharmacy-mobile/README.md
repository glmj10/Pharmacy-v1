# 💊 Pharmacy Mobile App - Ứng dụng Bán Thuốc

Ứng dụng mobile bán thuốc được xây dựng với React Native và Expo, cung cấp trải nghiệm mua sắm thuốc trực tuyến tiện lợi và an toàn.

## 🎯 Tính năng chính

### 🏠 Trang chủ (Home)
- ✨ Banner quảng cáo sản phẩm/khuyến mãi
- 🔍 Thanh tìm kiếm thuốc thông minh
- 📁 Danh mục thuốc đa dạng
- ⭐ Sản phẩm nổi bật với giá ưu đãi
- ⚡ Quick actions: Đơn hàng, Tìm nhà thuốc, Tư vấn, Ưu đãi
- 💡 Banner mẹo sức khỏe

### 🛍️ Danh sách sản phẩm (Products)
- 📱 Hiển thị danh sách sản phẩm theo lưới 2 cột
- 🔎 Tìm kiếm sản phẩm theo tên
- 🎛️ Bộ lọc theo danh mục, thương hiệu, giá
- 🔄 Sắp xếp theo giá, tên, đánh giá
- 🏷️ Badge hiển thị % giảm giá
- 📦 Trạng thái còn hàng/hết hàng

### 📋 Chi tiết sản phẩm (Product Detail)
- 🖼️ Gallery ảnh sản phẩm với thumbnail
- ℹ️ Thông tin chi tiết: Thương hiệu, Đánh giá, Giá, Tồn kho
- 💊 Thông tin y tế: Thành phần, Liều lượng, Cách dùng, Tác dụng phụ
- ➕➖ Chọn số lượng mua
- 📑 Tabs: Thông tin sản phẩm / Đánh giá
- 🛒 Nút thêm vào giỏ hàng
- 💳 Nút mua ngay
- ❤️ Thêm vào danh sách yêu thích

### 🛒 Giỏ hàng (Cart)
- 📝 Danh sách sản phẩm trong giỏ
- ☑️ Checkbox chọn sản phẩm thanh toán
- ➕➖ Tăng/giảm số lượng sản phẩm
- 🗑️ Xóa sản phẩm khỏi giỏ
- 🎫 Chọn mã giảm giá
- 💰 Tổng kết: Tạm tính, Giảm giá, Phí ship, Tổng cộng
- 💳 Nút thanh toán

### 👤 Tài khoản (Profile)
- 👨‍💼 Thông tin cá nhân với avatar
- 📊 Thống kê: Số đơn hàng, Yêu thích, Đánh giá
- 📋 Menu: Đơn hàng, Địa chỉ, Yêu thích, Đánh giá, Đơn thuốc, Thông báo, Cài đặt
- 🚪 Nút đăng xuất

## 🏗️ Cấu trúc dự án

```
pharmacy-mobile/
├── app/
│   ├── (tabs)/              # Tab navigation screens
│   │   ├── index.tsx        # Home screen
│   │   ├── products.tsx     # Products listing
│   │   ├── cart.tsx         # Shopping cart
│   │   └── profile.tsx      # User profile
│   ├── screens/             # Additional screens
│   │   ├── ProductsScreen.tsx
│   │   └── ProductDetailScreen.tsx
│   └── _layout.tsx          # Root layout
├── components/              # Reusable components
│   ├── ProductCard.tsx
│   ├── CategoryCard.tsx
│   ├── SearchBar.tsx
│   └── CartItem.tsx
├── services/                # API services
│   ├── api.ts
│   ├── productService.ts
│   ├── categoryService.ts
│   └── cartService.ts
├── types/                   # TypeScript types
├── constants/               # Constants & theme
├── utils/                   # Utility functions
└── contexts/                # React contexts
```

## 🎨 Design System

**Màu sắc chủ đạo:**
- Primary: `#00A86B` (Xanh lá y tế)
- Secondary: `#FF6B6B`
- Success: `#27AE60`
- Warning: `#F39C12`
- Error: `#E74C3C`

## 🚀 Cài đặt và chạy

1. **Cài đặt dependencies**
```bash
npm install
```

2. **Chạy ứng dụng**
```bash
npm start
# hoặc
npx expo start
```

3. **Chọn platform**
- Nhấn `a` - Android emulator
- Nhấn `i` - iOS simulator  
- Quét QR code - Expo Go app

## 🔧 Cấu hình API

Cập nhật URL API trong `services/api.ts`:
```typescript
const API_BASE_URL = 'http://your-api-url.com/api';
```

## 📦 Dependencies chính

- React Native 0.81.5
- Expo ~54.0.23
- Expo Router ~6.0.14
- Axios
- TypeScript

## 🎯 Tính năng sắp tới

- [ ] Đăng nhập/Đăng ký
- [ ] Thanh toán VNPay, MoMo
- [ ] Thông báo push
- [ ] Chat tư vấn
- [ ] Tra cứu thuốc theo triệu chứng
- [ ] Lịch sử đơn hàng
- [ ] Nhắc uống thuốc
- [ ] Tích điểm thành viên

## 📄 License

MIT License

---

**Lưu ý**: Đây là phiên bản demo với mock data. Cần tích hợp API backend thực tế.
