import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Tag, Loader2, Share2, Facebook, Twitter, ArrowRight } from 'lucide-react';
import blogService from '../api/blogService';
import AsyncImage from '../components/common/AsyncImage';
import Breadcrumb from '../components/common/BreadCrumb';
import type { Blog } from '../types/blog.types';

const BlogDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const [blog, setBlog] = useState<Blog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]); // State lưu bài viết liên quan
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (slug) {
          // 1. Lấy chi tiết bài viết
          const res: any = await blogService.getBlogBySlug(slug);
          const currentBlog: Blog = res.data || res.result;
          setBlog(currentBlog);

          // 2. Lấy bài viết liên quan (Dựa theo Category của bài viết hiện tại)
          if (currentBlog && currentBlog.category) {
            try {
              // Gọi API lấy 5 bài viết mới nhất thuộc cùng danh mục
              const resRelated: any = await blogService.getAllBlogs(
                1, 
                5, 
                undefined, // title
                currentBlog.category.slug // category slug
              );
              
              const listRelated = resRelated.data?.content || resRelated.result?.content || [];
              
              // Lọc bỏ bài viết đang xem hiện tại
              const filteredList = listRelated.filter((item: Blog) => item.id !== currentBlog.id);
              
              setRelatedBlogs(filteredList);
            } catch (err) {
              console.error("Lỗi lấy bài liên quan", err);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching blog detail", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) return <div className="min-h-[80vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  if (!blog) return <div className="text-center py-20 text-gray-500">Bài viết không tồn tại.</div>;

  return (
    <div className="bg-white min-h-screen pb-12">
      <div className="container mx-auto px-4 py-8">
        
        <Breadcrumb items={[
          { label: "Góc sức khỏe", link: "/blogs" },
          { label: blog.title }
        ]} className="mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* === CỘT CHÍNH: NỘI DUNG BÀI VIẾT === */}
          <div className="lg:col-span-2">
            
            {/* Header Bài viết */}
            <div className="mb-8">
              {blog.category && (
                <Link 
                  to={`/blogs?category=${blog.category.slug}`}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-primary text-xs font-bold rounded-full mb-4 hover:bg-blue-100 transition"
                >
                  <Tag className="w-3 h-3" /> {blog.category.name}
                </Link>
              )}
              
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-4">
                {blog.title}
              </h1>
              
              <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /> {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                
                {/* Social Share Buttons */}
                <div className="flex gap-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition">
                    <Facebook className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-sky-500 hover:bg-sky-50 rounded-full transition">
                    <Twitter className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="rounded-2xl overflow-hidden mb-8 shadow-sm">
              <AsyncImage 
                src={blog.thumbnail} 
                className="w-full max-h-[400px] object-cover" 
              />
            </div>

            {/* Content Body */}
            <div 
              className="prose prose-lg prose-blue max-w-none text-gray-700 leading-relaxed prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            >
            </div>

          </div>

          {/* === CỘT PHẢI: BÀI VIẾT LIÊN QUAN === */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h3 className="text-lg font-bold text-slate-900 mb-6 border-l-4 border-primary pl-3">
                Bài viết cùng chủ đề
              </h3>
              
              {relatedBlogs.length > 0 ? (
                <div className="flex flex-col gap-6">
                  {relatedBlogs.map(item => (
                    <Link key={item.id} to={`/blogs/${item.slug}`} className="group flex gap-4 items-start">
                      <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
                        <AsyncImage 
                          src={item.thumbnail}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-800 text-sm line-clamp-2 group-hover:text-primary transition mb-1 leading-snug">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                          <Calendar className="w-3 h-3" /> 
                          {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">Chưa có bài viết liên quan.</p>
              )}

              {/* Banner Quảng cáo (Optional) */}
              <div className="mt-10 rounded-xl overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-500 p-6 text-white text-center shadow-lg relative">
                <div className="relative z-10">
                  <h4 className="font-bold text-xl mb-2">Tải App Pharmacy</h4>
                  <p className="text-sm opacity-90 mb-4">Nhận ngay voucher 50k cho đơn hàng đầu tiên</p>
                  <button className="bg-white text-blue-600 px-6 py-2 rounded-full font-bold hover:bg-blue-50 transition w-full text-sm">
                    Tải ngay
                  </button>
                </div>
                {/* Decorative circle */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BlogDetail;