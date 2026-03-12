export interface Category {
  id: number;
  name: string;
  slug: string;
  thumbnail: string;
  parentId?: number;
  children?: Category[]; // Đệ quy: Danh mục con
}