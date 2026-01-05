import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import blogService from '../api/blogService';
import { type Blog as BlogType } from '../types/blog.types';
import BlogCard from '../components/blog/BlogCard'; // Component mới
import { Loader2 } from 'lucide-react';
import Breadcrumb from '../components/common/BreadCrumb';

const Blog: React.FC = () => {
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get('category'); // Lấy filter category từ URL

  const [blogs, setBlogs] = useState<BlogType[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        // Gọi API với tham số category nếu có
        const res: any = await blogService.getAllBlogs(page, 12, undefined, categorySlug || undefined);
        const pageData = res.data || res.result;
        
        setBlogs(pageData?.content || []);
        setTotalPages(pageData?.totalPages || 1);
      } catch (error) {
        console.error("Error fetching blogs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [page, categorySlug]); // Reload khi page hoặc category thay đổi

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      {/* Header Banner */}
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb items={[{ label: "Góc sức khỏe" }]} className="mb-4" />
          <h1 className="text-3xl font-bold text-slate-900">
            {categorySlug ? `Danh mục: ${categorySlug}` : "Góc sức khỏe"}
          </h1>
          <p className="text-gray-500 mt-2">Kiến thức y khoa và mẹo vặt sức khỏe hữu ích.</p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : blogs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map(blog => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
            
            {/* Pagination UI đơn giản */}
            {totalPages > 1 && (
               <div className="flex justify-center gap-2 mt-10">
                 {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                   <button
                     key={pageNum}
                     onClick={() => setPage(pageNum)}
                     className={`w-10 h-10 rounded-lg border ${page === pageNum ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                   >
                     {pageNum}
                   </button>
                 ))}
               </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-gray-500">Chưa có bài viết nào.</div>
        )}
      </div>
    </div>
  );
};

export default Blog;