import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User } from 'lucide-react';
import type { Article } from '../../types/article.types';
import AsyncImage from '../common/AsyncImage';

interface ArticleCardProps {
  article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 group h-full flex flex-col">
      {/* Thumbnail */}
      <Link to={`/articles/${article.slug}`} className="block relative overflow-hidden h-48">
        <AsyncImage 
          // AsyncImage của chúng ta đã hỗ trợ cả URL và UUID
          src={article.thumbnail} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
          {article.category}
        </div>
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {new Date(article.createdAt).toLocaleDateString('vi-VN')}
          </span>
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" /> {article.author}
          </span>
        </div>

        <Link to={`/articles/${article.slug}`} className="block mb-2">
          <h3 className="text-lg font-bold text-slate-800 line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
        </Link>

        <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
          {article.summary}
        </p>

        <Link 
          to={`/articles/${article.slug}`} 
          className="text-sm font-medium text-primary hover:underline inline-flex items-center"
        >
          Đọc tiếp &rarr;
        </Link>
      </div>
    </div>
  );
};

export default ArticleCard;