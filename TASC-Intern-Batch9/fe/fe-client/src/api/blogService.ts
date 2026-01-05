import type { ApiResponse, PageResponse } from '../types';
import type { Blog } from '../types/blog.types';
import axiosClient from './axiosClient';
const blogService = {
  getAllBlogs: (pageIndex: number = 1, pageSize: number = 10, title?: string, categorySlug?: string) => {
    const params: any = { pageIndex, pageSize };
    if (title) params.title = title;
    if (categorySlug) params.category = categorySlug; 

    return axiosClient.get<ApiResponse<PageResponse<Blog[]>>>('/blogs', { params });
  },

  getBlogBySlug: (slug: string) => {
    return axiosClient.get<ApiResponse<Blog>>(`/blogs/slug/${slug}`);
  }
};

export default blogService;