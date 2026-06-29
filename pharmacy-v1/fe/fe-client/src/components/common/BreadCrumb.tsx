import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface BreadcrumbItem {
  label: string;
  link?: string; // Nếu không có link -> Là trang hiện tại (Active)
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  return (
    <nav className={cn("flex items-center text-sm text-gray-500 mb-6", className)} aria-label="Breadcrumb">
      <ol className="flex items-center flex-wrap gap-1 md:gap-2">
        
        {/* 1. Trang chủ luôn luôn xuất hiện đầu tiên */}
        <li className="flex items-center">
          <Link 
            to="/" 
            className="flex items-center hover:text-primary transition-colors"
            title="Trang chủ"
          >
            <Home className="w-4 h-4" />
          </Link>
        </li>

        {/* 2. Render danh sách các items truyền vào */}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center">
              <ChevronRight className="w-4 h-4 mx-1 text-gray-400 shrink-0" />
              
              {item.link && !isLast ? (
                // Nếu có link và chưa phải cuối cùng -> Render Link
                <Link 
                  to={item.link} 
                  className="hover:text-primary transition-colors whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ) : (
                // Nếu là cuối cùng hoặc không có link -> Render Text đậm
                <span className="font-medium text-slate-900 line-clamp-1 max-w-[200px] md:max-w-xs" title={item.label}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;