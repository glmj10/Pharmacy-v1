import React, { useState, useEffect } from 'react';
import { Filter, X, Check, ChevronRight, ChevronDown } from 'lucide-react';
import type { ProductFilterRequest } from '../../types/product';
import type { Category } from '../../types/category.types'; // Import type Category
import categoryService from '../../api/categoryService'; // Import Service
import { cn } from '../../lib/utils';

// Dữ liệu giả thương hiệu
const MOCK_BRANDS = [
  { id: "brand1", name: "Mega We Care" },
  { id: "brand2", name: "Sanofi" },
  { id: "brand3", name: "Rohto" },
  { id: "brand4", name: "Dược Hậu Giang" },
  { id: "brand5", name: "Omron" },
];

interface ProductFilterProps {
  currentFilters: ProductFilterRequest;
  onFilterChange: (newFilters: ProductFilterRequest) => void;
  className?: string;
}

const ProductFilter: React.FC<ProductFilterProps> = ({ currentFilters, onFilterChange, className }) => {
  const [priceFrom, setPriceFrom] = useState<string>(currentFilters.priceFrom?.toString() || '');
  const [priceTo, setPriceTo] = useState<string>(currentFilters.priceTo?.toString() || '');
  
  // State lưu danh sách danh mục từ API
  const [categories, setCategories] = useState<Category[]>([]);
  // State quản lý việc đóng/mở các danh mục cha (để giao diện gọn hơn)
  const [expandedCats, setExpandedCats] = useState<number[]>([]);

  // 1. Fetch Danh mục khi component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response: any = await categoryService.getCategoriesTree();
        // Xử lý safe data giống bên Header
        let categoryList: Category[] = [];
        if (Array.isArray(response)) categoryList = response;
        else if (response && Array.isArray(response.result)) categoryList = response.result;
        else if (response && Array.isArray(response.data)) categoryList = response.data;
        
        setCategories(categoryList);
        
        // Mặc định mở tất cả danh mục cấp 1 để người dùng dễ nhìn
        setExpandedCats(categoryList.map(c => c.id));
      } catch (error) {
        console.error("Lỗi tải danh mục filter", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    setPriceFrom(currentFilters.priceFrom?.toString() || '');
    setPriceTo(currentFilters.priceTo?.toString() || '');
  }, [currentFilters]);

  // Handler: Chọn danh mục
  const handleCategoryChange = (slug: string) => {
    // Nếu click vào danh mục đang chọn -> Bỏ chọn (toggle), ngược lại -> Chọn mới
    const newCategory = currentFilters.category === slug ? undefined : slug;
    onFilterChange({ ...currentFilters, category: newCategory });
  };

  // Handler: Đóng/Mở accordion danh mục
  const toggleExpand = (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn chặn click nhầm vào việc chọn filter
    setExpandedCats(prev => 
      prev.includes(id) ? prev.filter(catId => catId !== id) : [...prev, id]
    );
  };

  const handleBrandChange = (brandName: string) => {
    const newBrand = currentFilters.brand === brandName ? undefined : brandName;
    onFilterChange({ ...currentFilters, brand: newBrand });
  };

  const applyPriceFilter = () => {
    const from = priceFrom ? Number(priceFrom) : undefined;
    const to = priceTo ? Number(priceTo) : undefined;
    onFilterChange({ ...currentFilters, priceFrom: from, priceTo: to });
  };

  // ===> HÀM RENDER ĐỆ QUY DANH MỤC <===
  const renderCategoryItem = (cat: Category, level = 0) => {
    const isSelected = currentFilters.category === cat.slug;
    const hasChildren = cat.children && cat.children.length > 0;
    const isExpanded = expandedCats.includes(cat.id);

    return (
      <div key={cat.id} className="w-full">
        <div 
          className={cn(
            "flex items-center justify-between py-1.5 px-2 rounded-lg cursor-pointer transition text-sm mb-1",
            isSelected 
              ? "bg-primary/10 text-primary font-bold" 
              : "text-gray-600 hover:bg-gray-50 hover:text-primary",
            level > 0 && "ml-4 border-l border-gray-100" // Thụt lề cho danh mục con
          )}
          onClick={() => handleCategoryChange(cat.slug)}
        >
          <span className="flex-1 truncate">{cat.name}</span>
          
          {/* Nút mũi tên để đóng mở con */}
          {hasChildren && (
            <button 
              onClick={(e) => toggleExpand(cat.id, e)}
              className="p-1 text-gray-400 hover:text-primary rounded-full hover:bg-gray-200 transition"
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Render con đệ quy */}
        {hasChildren && isExpanded && (
          <div className="border-l border-gray-100 ml-2">
            {cat.children!.map(child => renderCategoryItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("bg-white p-5 rounded-xl border border-gray-200 shadow-sm", className)}>
      <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
        <Filter className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-slate-800">Bộ lọc tìm kiếm</h3>
      </div>

      <div className="space-y-8">
        
        {/* 1. LỌC THEO DANH MỤC (PHẦN MỚI) */}
        <div>
          <h4 className="font-semibold text-sm mb-3 text-slate-700 uppercase tracking-wider">Danh mục</h4>
          <div className="max-h-80 overflow-y-auto pr-1 scrollbar-thin">
            {categories.length > 0 ? (
              categories.map(cat => renderCategoryItem(cat))
            ) : (
              <p className="text-xs text-gray-400 italic">Đang tải danh mục...</p>
            )}
          </div>
        </div>

        {/* 2. Lọc theo Khoảng giá */}
        <div>
          <h4 className="font-semibold text-sm mb-3 text-slate-700 uppercase tracking-wider">Khoảng giá</h4>
          <div className="flex items-center gap-2 mb-3">
            <input 
              type="number" 
              placeholder="Từ" 
              value={priceFrom}
              onChange={(e) => setPriceFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
            <span className="text-gray-400">-</span>
            <input 
              type="number" 
              placeholder="Đến" 
              value={priceTo}
              onChange={(e) => setPriceTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          <button onClick={applyPriceFilter} className="w-full py-2 bg-blue-50 text-primary text-sm font-bold rounded-lg hover:bg-primary hover:text-white transition">
            Áp dụng
          </button>
        </div>

        {/* 3. Lọc theo Thương hiệu */}
        <div>
          <h4 className="font-semibold text-sm mb-3 text-slate-700 uppercase tracking-wider">Thương hiệu</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
            {MOCK_BRANDS.map((brand) => {
              const isSelected = currentFilters.brand === brand.name;
              return (
                <label key={brand.id} className="flex items-center gap-3 cursor-pointer group">
                  <div className={cn(
                    "w-5 h-5 border rounded flex items-center justify-center transition",
                    isSelected ? "bg-primary border-primary" : "border-gray-300 bg-white group-hover:border-primary"
                  )}>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={isSelected} onChange={() => handleBrandChange(brand.name)} />
                  <span className={cn("text-sm transition", isSelected ? "text-primary font-medium" : "text-gray-600 group-hover:text-primary")}>
                    {brand.name}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Nút Xóa bộ lọc */}
        <button onClick={() => onFilterChange({})} className="w-full py-2 border border-red-200 text-red-500 text-sm font-medium rounded-lg hover:bg-red-50 transition flex items-center justify-center gap-2">
          <X className="w-4 h-4" /> Xóa tất cả bộ lọc
        </button>
      </div>
    </div>
  );
};

export default ProductFilter;