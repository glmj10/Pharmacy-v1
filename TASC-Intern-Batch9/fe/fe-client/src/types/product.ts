// Request Filter DTO khớp với Backend
export interface ProductFilterRequest {
  title?: string;       // Tìm kiếm theo tên
  priceFrom?: number;   // Giá thấp nhất
  priceTo?: number;     // Giá cao nhất
  isAscending?: boolean; // Sắp xếp giá: true (Tăng dần), false (Giảm dần), null (Mặc định)
  brand?: string;       // Tên thương hiệu
  category?: string;    // Slug danh mục
  page?: number;        // Phân trang (Optional)
  limit?: number;       // Số lượng item/trang (Optional)
}

