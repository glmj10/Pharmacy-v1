// Định nghĩa kiểu cho Type (Product vs Article)
export interface CategoryType {
  id: number;
  name: string; // Ví dụ: "PRODUCT", "ARTICLE"
  code?: string;
}

// Map với CategoryResponse của Java
export interface Category {
  id: number;
  name: string;
  thumbnail?: string;
  slug: string;
  priority?: number;
  type?: CategoryType;
  parentId?: number;
  children?: Category[]; // Đệ quy: Danh mục con chứa danh sách danh mục
}