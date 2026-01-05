import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Tag } from 'lucide-react';
import AsyncImage from '../common/AsyncImage';
import type { Blog } from '../../types/blog.types';

interface BlogCardProps {
  blog: Blog;
}

const BlogCard: React.FC<BlogCardProps> = ({ blog }) => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 group h-full flex flex-col">
      {/* Thumbnail */}
      <Link to={`/blogs/${blog.slug}`} className="block relative overflow-hidden h-48">
        <AsyncImage 
          src={blog.thumbnail} // Backend trả URL hoặc UUID
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        {blog.category && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm flex items-center gap-1">
            <Tag className="w-3 h-3" /> {blog.category.name}
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
          </span>
        </div>

        <Link to={`/blogs/${blog.slug}`} className="block mb-2">
          <h3 className="text-lg font-bold text-slate-800 line-clamp-2 group-hover:text-primary transition-colors">
            {blog.title}
          </h3>
        </Link>

        {/* Trích dẫn ngắn (cắt từ content HTML nếu không có field summary) */}
        <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
          {blog.content.replace(/<[^>]+>/g, '').substring(0, 150)}...
        </p>

        <Link 
          to={`/blogs/${blog.slug}`} 
          className="text-sm font-medium text-primary hover:underline inline-flex items-center mt-auto"
        >
          Đọc tiếp &rarr;
        </Link>
      </div>
    </div>
  );
};

export default BlogCard;