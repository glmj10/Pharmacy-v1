import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Image as ImageIcon } from 'lucide-react';
import type { Category } from '../../types/category.types';
import { cn } from '../../lib/utils';
import AsyncImage from './AsyncImage';

interface CategoryMenuItemProps {
  category: Category;
  depth?: number;
}

const CategoryMenuItem: React.FC<CategoryMenuItemProps> = ({ category, depth = 0 }) => {
  const hasChildren = category.children && category.children.length > 0;
  const [isOpen, setIsOpen] = useState(false);

  // Render Thumbnail (Chỉ hiện ở menu con, không hiện ở Root bar)
  const renderThumbnail = () => {
    if (depth === 0) return null;

    return (
      <div className="w-8 h-8 rounded border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
        {category.thumbnail ? (
        <AsyncImage 
          uuid={category.thumbnail} 
          className="w-full h-full object-cover"
        />
        ) : (
          <ImageIcon className="w-4 h-4 text-gray-300" />
        )}
        <ImageIcon className={cn("w-4 h-4 text-gray-300 hidden", !category.thumbnail && "block")} />
      </div>
    );
  };

  // 1. Nếu KHÔNG có con -> Render Link thường
  if (!hasChildren) {
    return (
      <Link 
        to={`/categories/${category.slug}`}
        className={cn(
          "flex items-center gap-3 px-4 py-2 hover:bg-blue-50 hover:text-primary transition text-sm text-gray-700 whitespace-nowrap",
          depth === 0 && "py-0 px-0 hover:bg-transparent font-medium text-base hover:text-primary block" 
        )}
      >
        {renderThumbnail()}
        <span className="font-medium">{category.name}</span>
      </Link>
    );
  }

  // 2. Nếu CÓ con -> Render Group với Click Toggle
  return (
    <div 
      className={cn(
        "relative",
        depth === 0 ? "h-full flex items-center" : "w-full"
      )}
    >
      
      {/* Nút Trigger (Tên danh mục) */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={cn(
          "flex items-center justify-between gap-2 cursor-pointer transition text-gray-700 whitespace-nowrap",
          depth === 0 
            ? "font-medium hover:text-primary py-2" // Root
            : "px-4 py-2 hover:bg-blue-50 text-sm hover:text-primary w-full" // Sub-item
        )}
      >
        <div className="flex items-center gap-3">
          {renderThumbnail()}
          <span className={cn(depth > 0 && "font-medium")}>{category.name}</span>
        </div>

        {/* Icon mũi tên */}
        {depth === 0 ? (
          <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
        ) : (
          <ChevronRight className={cn("w-4 h-4 text-gray-400 transition-transform", isOpen && "rotate-90")} />
        )}
      </button>

      {/* DROPDOWN MENU (Hiện khi isOpen = true) */}
      {isOpen && (
        <div 
          className={cn(
            "absolute bg-white shadow-xl border border-gray-100 rounded-lg min-w-[240px] z-50 animate-in fade-in zoom-in-95 duration-200",
            depth === 0 ? "top-full left-0 mt-2" : "top-0 left-full ml-1"
          )}
        >
          <div className="py-2">
             {category.children?.map((child) => (
               <CategoryMenuItem key={child.id} category={child} depth={depth + 1} />
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryMenuItem;