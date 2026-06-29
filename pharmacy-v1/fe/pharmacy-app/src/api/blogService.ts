import axiosClient from './axiosClient';
import { ApiResponse, PageResponse } from '../types';
import { Blog } from '../types/blog';

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
