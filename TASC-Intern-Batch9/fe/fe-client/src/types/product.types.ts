import type { Promotion } from "./promotion.type";

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

export interface Product {
  id: number;
  title: string;
  thumbnail?: string;
  slug: string;
  quantity: number;
  active: boolean;
  priceNew: number;
  priceOld: number;
  description?: string;
  manufacturer?: string;       
  brand?: {                    
    id: number;
    name: string;
  };
  productType?: string;
  indication?: string;
  registrationNumber?: string;
  activeIngredient?: string;
  dosageForm?: string;
  noted?: string;
  images?: string[];
  inWishlist?: boolean;
  numberOfLikes?: number,
  promotionEvent?: Promotion | null; 
}