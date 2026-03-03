PHARMACY MOBILE APP - TECHNICAL DOCUMENTATION
1. Tổng quan dự án (Overview)
Hệ thống thương mại điện tử kinh doanh dược phẩm, thực phẩm chức năng và thiết bị y tế. Ứng dụng Mobile đóng vai trò là kênh bán hàng B2C cho khách hàng cuối.
Kiến trúc: Microservices (Frontend Mobile giao tiếp qua API Gateway).
Authentication: JWT (Access Token & Refresh Token).
Response Standard: Tất cả API đều trả về format chuẩn ApiResponse.
2. Quy chuẩn chung (Conventions)
2.1. Cấu trúc Response (ApiResponse)
Mọi API đều trả về JSON bọc trong cấu trúc sau:
code
TypeScript
interface ApiResponse<T> {
  code: number;      // Mã lỗi (200 = Success, còn lại là lỗi)
  message: string;   // Thông báo
  data: T;           // Dữ liệu chính (Có thể là object, list, hoặc null)
}
Lưu ý: Một số API cũ có thể trả về key là result thay vì data, cần kiểm tra kỹ.
2.2. Phân trang (PageResponse)
Các API danh sách (List) thường được bọc trong PageResponse:
code
TypeScript
interface PageResponse<T> {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
  content: T; // Danh sách dữ liệu thực tế
}
2.3. Xử lý Ảnh (Image Handling)
Hệ thống sử dụng cơ chế UUID hoặc URL.
Product Service: Trả về thumbnail là UUID. Cần gọi API /file-url?uuid={uuid} để lấy link thật.
Cart Service / Promotion: Có thể trả về thumbnailUrl là Link trực tiếp.
Mobile App Logic: Cần xây dựng component AsyncImage để tự động kiểm tra: Nếu là Link -> Hiển thị luôn; Nếu là UUID -> Gọi API lấy Link.
2.4. Refresh Token Mechanism
Access Token có thời hạn ngắn. Khi API trả về 401 Unauthorized, Mobile App cần tự động gọi API refresh-token, lưu token mới và thực hiện lại request cũ.
Cần xử lý Concurrency (Hàng đợi) để tránh gọi Refresh Token nhiều lần cùng lúc.
3. Danh sách API (API Specifications)
Base URL: https://api.domain.com/api/v1 (Ví dụ)
A. Authentication & User (Identity Service)
Prefix: /auth
Method	Endpoint	Mô tả	Request Body / Params
POST	/auth/login	Đăng nhập	{ email, password }
POST	/auth/register	Đăng ký	{ email, username, password, confirmPassword }
POST	/auth/logout	Đăng xuất	Header: Authorization: Bearer <token>
POST	/auth/refresh-token	Làm mới token	{ token: "old_token" }
POST	/auth/forgot-password	Quên mật khẩu	Query: ?email=...
POST	/auth/send-verification-email	Gửi lại OTP	Query: ?email=...
POST	/auth/reset-password	Đổi mật khẩu mới	{ email, otp, password, confirmPassword }
PATCH	/auth/verify	Xác thực tài khoản	{ email, otp }
PUT	/auth/change-password	Đổi mật khẩu (Logged in)	{ currentPassword, newPassword, confirmPassword }
PUT	/auth/info	Sửa hồ sơ & Avatar	FormData: info (JSON string), profilePic (File)
Prefix: /user
| Method | Endpoint | Mô tả | Response |
| :--- | :--- | :--- | :--- |
| GET | /user/me | Lấy thông tin User hiện tại | UserResponse |
B. Product Service (Sản phẩm & Danh mục)
Prefix: /products, /categories, /brands
Method	Endpoint	Mô tả	Params / Body
GET	/products	Lấy danh sách (Lọc/Sort)	pageIndex, pageSize, title, priceFrom, priceTo, brandSlug, category, isAscending
GET	/products/slug/{slug}	Chi tiết sản phẩm	-
GET	/products/related/{id}	Sản phẩm liên quan	-
GET	/categories/products/all	Cây danh mục sản phẩm	-
GET	/brands/customer/public	Danh sách thương hiệu	-
GET	/file-url	Lấy link ảnh từ UUID	Query: ?uuid=...
C. Cart Service (Giỏ hàng)
Prefix: /carts
Method	Endpoint	Mô tả	Request Body
GET	/carts	Xem giỏ hàng	-
GET	/carts/item/totalItems	Số lượng item (Badge)	-
POST	/carts	Thêm vào giỏ	{ productId, quantity }
PUT	/carts/item/{id}	Cập nhật số lượng	Query: ?quantity=...
PATCH	/carts/item/status/{id}	Chọn/Bỏ chọn item	Query: ?selected=true/false
PUT	/carts/item/status/all	Chọn tất cả	Query: ?selected=true/false
DEL	/carts/item/{id}	Xóa 1 item	-
DEL	/carts	Xóa sạch giỏ hàng	-
D. Profile & Address (Sổ địa chỉ)
Prefix: /profiles
Method	Endpoint	Mô tả	Request Body
GET	/profiles	Lấy danh sách địa chỉ	-
POST	/profiles	Thêm địa chỉ mới	{ fullName, phoneNumber, address }
PUT	/profiles/{id}	Sửa địa chỉ	{ fullName, phoneNumber, address }
DEL	/profiles/{id}	Xóa địa chỉ	-
E. Order & Payment (Đơn hàng)
Prefix: /orders, /payment
Method	Endpoint	Mô tả	Request Body / Params
POST	/orders	Tạo đơn hàng (Checkout)	{ profileId, note, paymentMethod, voucherId? }
GET	/orders/my-orders	Lịch sử đơn hàng	pageIndex, pageSize, status
GET	/orders/detail/{id}	Chi tiết đơn hàng	-
PUT	/orders/cancel/{id}	Hủy đơn hàng	-
GET	/payment/vnpay-return	Callback VNPay	Query params từ VNPay
GET	/payment/repay/{id}	Lấy link thanh toán lại	-
F. Promotion & Voucher
Prefix: /promotions, /vouchers
Method	Endpoint	Mô tả	Params
GET	/promotions/products/current	Lấy sự kiện KM đang chạy	-
GET	/promotion-items/{eventId}	Lấy SP trong sự kiện	pageIndex, pageSize
GET	/vouchers	Săn voucher (Public)	pageIndex, pageSize
GET	/vouchers/user/me	Ví voucher (Đã lưu)	pageIndex, pageSize
POST	/vouchers/claim	Lưu voucher	{ voucherId }
G. Blog & Chatbot & Rating
Prefix: /blogs, /rates, /agents
Method	Endpoint	Mô tả	Request Body
GET	/blogs	Danh sách bài viết	pageIndex, pageSize, category
GET	/blogs/slug/{slug}	Chi tiết bài viết	-
GET	/categories/blogs/all	Danh mục bài viết	-
GET	/rates/{productId}	Xem đánh giá SP	rating (filter sao)
POST	/rates	Viết đánh giá	{ rating, orderDetailId, comment }
POST	/agents/ask	Chat với Dược sĩ AI	{ sessionId, message }
4. Data Models (TypeScript Interfaces)
Dưới đây là các định nghĩa kiểu dữ liệu chính để sử dụng trong App.
code
TypeScript
// 1. AUTH & USER
export interface User {
  id: number;
  username: string;
  email: string;
  profilePic?: string; // UUID
  token?: string;
}

// 2. PRODUCT
export interface Product {
  id: number;
  title: string;
  priceNew: number;
  priceOld: number;
  thumbnail: string; // UUID
  thumbnailUrl?: string; // URL (nếu có)
  slug: string;
  quantity: number;
  active: boolean;
  description?: string; // HTML Content
  manufacturer?: string;
  brand?: { id: number; name: string };
  productType?: string;
  indication?: string;
  activeIngredient?: string;
  dosageForm?: string;
  promotion?: {
    id: number;
    name: string;
    thumbnailUrl: string;
    endTime: string;
  };
  inWishlist?: boolean;
  images?: string[]; // List UUID
}

// 3. CART
export interface CartItemResponse {
  id: number;
  product: Product;
  quantity: number;
  priceAtAddition: number;
  selected: boolean;
  isOutOfStock: boolean;
}

// 4. ORDER
export interface OrderResponse {
  id: number;
  totalPrice: number;
  status: 'PENDING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED' | 'FAILED';
  paymentMethod: 'COD' | 'VNPAY';
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  customerName: string;
  customerAddress: string;
}

// 5. VOUCHER
export interface Voucher {
  id: number;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  type: 'PUBLIC' | 'PRIVATE';
  discountValue: number;
  minOrderValue: number;
  endDate: string;
  isClaimed: boolean;
}
5. Logic Nghiệp vụ Quan trọng
5.1. Quy trình Thanh toán (Checkout Flow)
Cart: Người dùng tick chọn sản phẩm (updateItemStatus). Frontend tính tạm tính.
Checkout Page:
Gọi API lấy danh sách items trong giỏ (lọc selected=true).
Chọn địa chỉ từ sổ địa chỉ (AddressList).
Chọn Voucher (nếu có) -> Gửi voucherId.
Bấm "Đặt hàng" -> Gọi API createOrder.
Xử lý kết quả:
Nếu VNPAY: API trả về URL -> Mở Webview hoặc Browser -> User thanh toán -> Quay về App.
Nếu COD: Chuyển thẳng sang màn hình thành công.
Sau khi đặt thành công -> Gọi API clearCart (hoặc fetchCart để backend tự sync) để xóa các món đã mua.
5.2. Chức năng Chatbot
Sử dụng API /agents/ask.
Tạo sessionId ngẫu nhiên và lưu vào Storage khi mở app lần đầu để giữ ngữ cảnh hội thoại.
Set timeout dài (60s) cho request này vì AI xử lý lâu.
5.3. Chức năng Blog
Nội dung bài viết trả về là HTML.
Mobile App cần dùng thư viện react-native-render-html (hoặc tương đương) để hiển thị nội dung Rich Text.
6. Môi trường (Environment)
Cấu hình file .env cho Mobile App:
code
Env
API_BASE_URL=http://<IP_MAY_TINH_BACKEND>:8080/api/v1
# Lưu ý: Trên máy ảo/thiết bị thật không dùng localhost, phải dùng IP LAN
API_TIMEOUT=10000
Tài liệu này được tổng hợp dựa trên quá trình phát triển Frontend Web ReactJS. Các logic về API và Data Model hoàn toàn tương thích để chuyển đổi sang Mobile App.