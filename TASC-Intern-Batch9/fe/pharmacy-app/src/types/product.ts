import { Brand } from "./brand";
import { Category } from "./category";


export interface ProductImage {
  id: number;
  imageUrl: string;
}

// 2. Định nghĩa Product Core
export interface Product {
  categories: Category[];
  id: number;
  title: string;            // Tên thuốc
  slug: string;             // URL friendly (dùng để gọi API detail)
  thumbnail?: string;
  thumbnailUrl: string;       // Ảnh đại diện
  priceNew: number;         // Giá bán hiện tại
  priceOld: number;         // Giá gốc (để gạch ngang nếu có KM)
  quantity: number;         // Tồn kho
  active: boolean;          // Trạng thái kinh doanh
  
  // --- Thông tin Y tế (Quan trọng cho App thuốc) ---
  activeIngredient?: string; // Hoạt chất (Ví dụ: Paracetamol)
  dosageForm?: string;       // Dạng bào chế (Viên nén, Siro...)
  indication?: string;       // Chỉ định (Chữa bệnh gì)
  productType?: string;      // Loại sản phẩm
  registrationNumber?: string; // Số đăng ký
  manufacturer?: string;     // Nhà sản xuất
  brand?: Brand;             // Thương hiệu
  category?: Category
  // --- Chi tiết hiển thị ---
  description?: string;      // Mô tả HTML/Text
  noted?: string;            // Lưu ý khi sử dụng
  images?: ProductImage[];         // Danh sách ảnh chi tiết (Slide ảnh)
  
  // --- User specific ---
  inWishlist?: boolean;      // User đã like chưa
  numberOfLikes?: number;
}


// Params gửi lên trong axios.get('/products', { params: ... })
export interface ProductParams {
  pageIndex?: number;     // Trang số mấy (Mặc định 1)
  pageSize?: number;      // Số lượng item/trang (Mặc định 12)
  title?: string;         // Từ khóa tìm kiếm
  priceFrom?: number;     // Giá từ
  priceTo?: number;       // Giá đến
  brandSlug?: string;     // Lọc theo thương hiệu
  category?: string;      // Lọc theo danh mục (slug)
  isAscending?: boolean;  // Sắp xếp giá tăng/giảm
}