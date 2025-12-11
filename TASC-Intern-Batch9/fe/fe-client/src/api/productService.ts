import axiosClient from './axiosClient';
import type { Product, ApiResponse, PageResponse } from '../types';
import type { ProductFilterRequest } from '../types/product';
// 1. KHO DỮ LIỆU GIẢ CHÍNH (MASTER DB)
// Định nghĩa đầy đủ các sản phẩm có thể xuất hiện
const MASTER_DB: Product[] = [
  {
    id: 1,
    title: "Viên uống Vitamin C 500mg tăng cường đề kháng",
    price_new: 120000,
    price_old: 150000,
    thumbnail: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400",
    slug: "vitamin-c-500mg",
    quantity: 100,
    active: true,
    description: "Vitamin C giúp tăng cường hệ miễn dịch...",
    images: [
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1616671276445-160d5f6b21c9?auto=format&fit=crop&q=80&w=800"
    ]
  },
  {
    id: 2,
    title: "Khẩu trang y tế 4 lớp kháng khuẩn (Hộp 50 cái)",
    price_new: 35000,
    price_old: 50000,
    thumbnail: "https://images.unsplash.com/photo-1584036561566-b45238f2e121?auto=format&fit=crop&q=80&w=400",
    slug: "khau-trang-y-te",
    quantity: 500,
    active: true,
    description: "Khẩu trang y tế 4 lớp chất lượng cao...",
    images: ["https://images.unsplash.com/photo-1584036561566-b45238f2e121?auto=format&fit=crop&q=80&w=800"]
  },
  {
    id: 3,
    title: "Nước súc miệng sát khuẩn họng Listerine (Chai 250ml)",
    price_new: 85000,
    price_old: 90000,
    thumbnail: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&q=80&w=400",
    slug: "nuoc-suc-mieng",
    quantity: 50,
    active: true,
    description: "Nước súc miệng giúp loại bỏ vi khuẩn...",
    images: ["https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&q=80&w=800"]
  },
  {
    id: 4,
    title: "Máy đo huyết áp điện tử bắp tay Omron",
    price_new: 850000,
    price_old: 1200000,
    thumbnail: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=400",
    slug: "may-do-huyet-ap",
    quantity: 20,
    active: true,
    description: "Máy đo huyết áp tự động chính xác cao...",
    images: ["https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800"]
  },
  {
    id: 5,
    title: "Gel rửa tay khô sát khuẩn (Chai 100ml)",
    price_new: 25000,
    price_old: 30000,
    thumbnail: "https://images.unsplash.com/photo-1585232004423-244e0e6904e3?auto=format&fit=crop&q=80&w=400",
    slug: "gel-rua-tay",
    quantity: 200,
    active: true,
    description: "Gel rửa tay khô tiện lợi...",
    images: ["https://images.unsplash.com/photo-1585232004423-244e0e6904e3?auto=format&fit=crop&q=80&w=800"]
  }
];

// Tạo thêm dữ liệu giả số lượng lớn cho trang Products (nhân bản từ Master)
const ALL_PRODUCTS_DB = Array.from({ length: 50 }).map((_, i) => ({
  ...MASTER_DB[i % MASTER_DB.length],
  id: i + 1,
  title: `${MASTER_DB[i % MASTER_DB.length].title} (Lô ${Math.floor(i / 5) + 1})`,
  slug: `${MASTER_DB[i % MASTER_DB.length].slug}-${i}` // Slug duy nhất: vitamin-c-0, vitamin-c-1...
}));


const productService = {
  // --- API THẬT ---
  getAll: (params: ProductFilterRequest) => {
    // Map tham số từ Frontend sang Backend
    const requestParams = {
      pageIndex: params.page || 1,      // Java: pageIndex
      pageSize: params.limit || 12,     // Java: pageSize

      // Các field của @ModelAttribute ProductFilterCustomerRequest
      title: params.title,
      priceFrom: params.priceFrom,
      priceTo: params.priceTo,
      brand: params.brand,
      category: params.category, // Backend xử lý lọc theo slug hoặc id

      // Xử lý sort (Tùy backend quy định field sort là gì, ví dụ: sortBy, sortDir)
      // Ở đây giả định backend nhận isAscending
      isAscending: params.isAscending
    };

    // Gọi GET /products
    return axiosClient.get<ApiResponse<PageResponse<Product[]>>>('/products', {
      params: requestParams
    });
  },

  getBySlug: (slug: string) => {
    return axiosClient.get<ApiResponse<Product>>(`/products/slug/${slug}`);
  },


  // --- MOCK API (Dùng cho Demo) ---

  // 1. Lấy danh sách (Hỗ trợ lọc & phân trang)
  mockGetAll: async (params?: ProductFilterRequest): Promise<{ data: Product[], total: number }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let result = [...ALL_PRODUCTS_DB];

        // Logic Lọc (Filter)
        if (params) {
          if (params.title) {
            result = result.filter(p => p.title.toLowerCase().includes(params.title!.toLowerCase()));
          }
          if (params.category) {
            // Giả lập lọc danh mục
            // result = result.filter(...)
          }
          if (params.priceFrom) result = result.filter(p => p.price_new >= params.priceFrom!);
          if (params.priceTo) result = result.filter(p => p.price_new <= params.priceTo!);

          if (params.isAscending !== undefined) {
            result.sort((a, b) => params.isAscending ? a.price_new - b.price_new : b.price_new - a.price_new);
          }
        }

        // Logic Phân trang (Pagination)
        const page = params?.page || 1;
        const limit = params?.limit || 10;
        const startIndex = (page - 1) * limit;
        const paginatedResult = result.slice(startIndex, startIndex + limit);

        resolve({
          data: paginatedResult,
          total: result.length
        });
      }, 500);
    });
  },

  // 2. Lấy chi tiết (FIXED LOGIC)
  mockGetBySlug: async (slug: string): Promise<Product | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Ưu tiên 1: Tìm chính xác trong ALL_PRODUCTS_DB (Dành cho trang Products)
        let found = ALL_PRODUCTS_DB.find(p => p.slug === slug);

        // Ưu tiên 2: Tìm trong MASTER_DB (Dành cho trang Home - vì Home dùng slug gốc)
        if (!found) {
          found = MASTER_DB.find(p => p.slug === slug);
        }

        // Ưu tiên 3: Nếu vẫn không thấy (Do Home.tsx tự generate slug ảo),
        // Ta tạo ra một sản phẩm giả lập để KHÔNG BỊ LỖI 404
        if (!found) {
          console.warn(`[MockData] Không tìm thấy slug "${slug}", đang tạo dữ liệu giả thay thế.`);
          found = {
            id: 999,
            title: `Sản phẩm Demo: ${slug}`,
            slug: slug,
            price_new: 150000,
            price_old: 200000,
            thumbnail: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&q=80&w=800",
            quantity: 100,
            active: true,
            description: "Đây là dữ liệu mô phỏng do sản phẩm chưa có trong Database giả.",
            images: ["https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&q=80&w=800"]
          };
        }

        resolve(found || null);
      }, 500);
    });
  },


  getRelated: (productId: number) => {
    return axiosClient.get<ApiResponse<any[]>>(`/products/related/${productId}`);
  },

  // 3. Lấy sản phẩm liên quan
  mockGetRelated: async (slug: string): Promise<Product[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Lấy ngẫu nhiên 4-8 sản phẩm trừ sản phẩm hiện tại
        const related = ALL_PRODUCTS_DB.filter(p => p.slug !== slug).slice(0, 8);
        resolve(related);
      }, 500);
    });
  }


};

export default productService;