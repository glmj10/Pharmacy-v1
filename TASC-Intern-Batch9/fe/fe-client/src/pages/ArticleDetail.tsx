import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, Facebook, Share2, Twitter, Loader2 } from 'lucide-react';
import articleService from '../api/articleService';
import AsyncImage from '../components/common/AsyncImage';
import type { Article } from '../types/article.types';
import Breadcrumb from '../components/common/BreadCrumb';

const ArticleDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (slug) {
          const data = await articleService.getArticleBySlug(slug);
          setArticle(data);
          
          if (data) {
            const related = await articleService.getRelatedArticles(slug);
            setRelatedArticles(related);
          }
        }
      } catch (error) {
        console.error("Error fetching article detail", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!article) {
    return <div className="text-center py-20 text-gray-500">Bài viết không tồn tại.</div>;
  }

  return (
    <div className="bg-white min-h-screen pb-12">
      <div className="container mx-auto px-4 py-8">
        
        <Breadcrumb items={[
          { label: "Góc sức khỏe", link: "/articles" },
          { label: article.title }
        ]} className="mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* CỘT CHÍNH: NỘI DUNG BÀI VIẾT */}
          <div className="lg:col-span-2">
            
            {/* Header Bài viết */}
            <div className="mb-8">
              <span className="inline-block px-3 py-1 bg-blue-50 text-primary text-xs font-bold rounded-full mb-4">
                {article.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-4">
                {article.title}
              </h1>
              
              <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4" /> {article.author}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /> {new Date(article.createdAt).toLocaleDateString('vi-VN')}
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
                uuid={article.thumbnail} 
                url={article.thumbnail}
                className="w-full max-h-[400px] object-cover" 
              />
            </div>

            {/* Content Body */}
            {/* Lưu ý: Dùng dangerouslySetInnerHTML cho nội dung HTML từ CMS */}
            <div 
              className="prose prose-lg prose-blue max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: article.content }}
            >
            </div>

          </div>

          {/* CỘT PHẢI: BÀI VIẾT LIÊN QUAN */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h3 className="text-lg font-bold text-slate-900 mb-6 border-l-4 border-primary pl-3">
                Bài viết liên quan
              </h3>
              
              <div className="flex flex-col gap-6">
                {relatedArticles.map(item => (
                  <Link key={item.id} to={`/articles/${item.slug}`} className="group flex gap-4 items-start">
                    <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      <AsyncImage 
                        uuid={item.thumbnail} 
                        url={item.thumbnail}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm line-clamp-2 group-hover:text-primary transition mb-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-500 mb-2">{item.category}</p>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Banner Quảng cáo (Giả lập) */}
              <div className="mt-10 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-cyan-400 p-6 text-white text-center shadow-lg">
                <h4 className="font-bold text-xl mb-2">Tải App Pharmacy</h4>
                <p className="text-sm opacity-90 mb-4">Nhận ngay voucher 50k cho đơn hàng đầu tiên</p>
                <button className="bg-white text-blue-600 px-6 py-2 rounded-full font-bold hover:bg-blue-50 transition w-full">
                  Tải ngay
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;