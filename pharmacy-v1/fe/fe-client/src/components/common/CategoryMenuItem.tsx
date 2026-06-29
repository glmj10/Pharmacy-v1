import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { type Category } from '../../types/category.types';
import AsyncImage from './AsyncImage';
import { cn } from '../../lib/utils';

interface CategoryMenuItemProps {
  category: Category;
  depth?: number;
  rootType?: 'PRODUCT' | 'BLOG';
}

const CategoryMenuItem: React.FC<CategoryMenuItemProps> = ({ category, depth = 0, rootType }) => {
  const hasChildren = category.children && category.children.length > 0;
  const [isOpen, setIsOpen] = useState(false);

  const getCategoryLink = () => {
    const typeName = category.type?.name || rootType || 'PRODUCT';
    if (typeName === 'BLOG') return `/blogs?category=${category.slug}`;
    return `/products?category=${category.slug}`;
  };

  const renderThumbnail = () => {
    if (depth === 0) return null;
    return (
      <div className="w-8 h-8 rounded border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
        <AsyncImage src={category.thumbnail} className="w-full h-full object-cover" fallbackSrc="" />
        {!category.thumbnail && <ImageIcon className="w-4 h-4 text-gray-300" />}
      </div>
    );
  };

  // 1. TRƯỜNG HỢP: KHÔNG CÓ CON (Giữ nguyên)
  if (!hasChildren) {
    return (
      <Link 
        to={getCategoryLink()}
        className={cn(
          "flex items-center gap-3 px-4 py-2 hover:bg-blue-50 hover:text-primary transition text-sm text-gray-700 whitespace-nowrap",
          depth === 0 && "py-2 px-0 hover:bg-transparent font-bold text-base hover:text-primary block" 
        )}
      >
        {renderThumbnail()}
        <span className="font-medium">{category.name}</span>
      </Link>
    );
  }

  // 2. TRƯỜNG HỢP: CÓ CON (TÁCH HÀNH ĐỘNG)
  return (
    <div 
      className={cn(
        "relative",
        depth === 0 ? "h-full flex items-center" : "w-full"
      )}
    >
      <div className={cn(
        "flex items-center justify-between w-full group transition-colors",
        depth === 0 ? "" : "hover:bg-blue-50" // Hover background cho cả dòng ở menu dọc
      )}>
        
        {/* ACTION 1: CLICK TÊN -> CHUYỂN TRANG */}
        <Link
          to={getCategoryLink()}
          className={cn(
            "flex items-center gap-3 flex-1 cursor-pointer text-gray-700 whitespace-nowrap",
            depth === 0 
              ? "font-bold hover:text-primary py-2" 
              : "px-4 py-2 text-sm group-hover:text-primary"
          )}
        >
          {renderThumbnail()}
          <span className={cn(depth > 0 && "font-medium")}>{category.name}</span>
        </Link>

        {/* ACTION 2: CLICK MŨI TÊN -> ĐÓNG/MỞ MENU */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className={cn(
            "p-2 text-gray-400 hover:text-primary transition-colors focus:outline-none",
            depth === 0 ? "hover:bg-transparent" : "hover:bg-blue-100"
          )}
        >
          {depth === 0 ? (
            <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isOpen && "rotate-180")} />
          ) : (
            <ChevronRight className={cn("w-4 h-4 transition-transform duration-200", isOpen && "rotate-90")} />
          )}
        </button>
      </div>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div 
          className={cn(
            "absolute bg-white shadow-xl border border-gray-100 rounded-lg min-w-[240px] z-50 animate-in fade-in zoom-in-95 duration-200",
            depth === 0 ? "top-full left-0 mt-2" : "top-0 left-full ml-1"
          )}
        >
          <div className="py-2">
             {category.children?.map((child) => (
               <CategoryMenuItem 
                  key={child.id} 
                  category={child} 
                  depth={depth + 1} 
                  rootType={rootType} 
               />
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryMenuItem;