export interface Blog {
  id: number;
  title: string;
  content: string;
  thumbnail: string;
  slug: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
}
