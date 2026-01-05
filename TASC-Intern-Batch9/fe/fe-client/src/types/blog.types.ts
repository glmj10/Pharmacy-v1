import type { Category } from "./category.types";

export interface Blog {
  id: number;
  title: string;
  content: string;
  thumbnail: string;
  slug: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}