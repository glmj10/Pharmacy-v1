import React, { useEffect, useState } from 'react';
import articleService from '../api/articleService';
import type { Article } from '../types/article.types';
import ArticleCard from '../components/blog/ArticleCard';
import { Loader2 } from 'lucide-react';
import Breadcrumb from '../components/common/BreadCrumb';

const Blog: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await articleService.getArticles();
        setArticles(data);
      } catch (error) {
        console.error("Error fetching articles", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      {/* Header Banner */}
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb items={[{ label: "Góc sức khỏe" }]} className="mb-4" />
          <h1 className="text-3xl font-bold text-slate-900">Góc sức khỏe</h1>
          <p className="text-gray-500 mt-2">Cập nhật những kiến thức y khoa, mẹo vặt sức khỏe hữu ích từ chuyên gia.</p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;