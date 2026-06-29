import React, { useState, useEffect } from 'react';
import { Filter, X, Check, ChevronRight, ChevronDown } from 'lucide-react';
import categoryService from '../../api/categoryService';
import { cn } from '../../lib/utils';
import type { Brand } from '../../types/brand.types';
import type { Category } from '../../types/category.types';
import type { ProductFilterRequest } from '../../types/product.types';
import brandService from '../../api/brandService'

interface ProductFilterProps {
  currentFilters: ProductFilterRequest;
  onFilterChange: (newFilters: ProductFilterRequest) => void;
  className?: string;
}

const ProductFilter: React.FC<ProductFilterProps> = ({ currentFilters, onFilterChange, className }) => {
  // State Local cho Input giá (để user nhập xong mới bấm áp dụng)
  const [priceFrom, setPriceFrom] = useState<string>(currentFilters.priceFrom?.toString() || '');
  const [priceTo, setPriceTo] = useState<string>(currentFilters.priceTo?.toString() || '');

  // State Data từ API
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // State UI
  const [loading, setLoading] = useState(true);
  const [expandedCats, setExpandedCats] = useState<number[]>([]); // Quản lý đóng/mở danh mục con

  // 1. Fetch Data (Category & Brand)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, brandRes] = await Promise.all([
          categoryService.getProductCategories(),
          brandService.getAllBrandsPublic()
        ]);

        // Xử lý Category
        const catData: any = catRes;
        const catList = catData.data || catData.result || [];
        if (Array.isArray(catList)) {
          setCategories(catList);
          // Mặc định mở các danh mục cấp 1
          setExpandedCats(catList.map((c: Category) => c.id));
        }

        // Xử lý Brand
        const brandData: any = brandRes;
        const brandList = brandData.data || brandData.result || [];
        if (Array.isArray(brandList)) {
          setBrands(brandList);
        }

      } catch (error) {
        console.error("Lỗi tải bộ lọc:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sync state giá khi props thay đổi (ví dụ khi reset filter)
  useEffect(() => {
    setPriceFrom(currentFilters.priceFrom?.toString() || '');
    setPriceTo(currentFilters.priceTo?.toString() || '');
  }, [currentFilters]);

  // --- HANDLERS ---

  // 1. Chọn Danh mục
  const handleCategoryChange = (slug: string) => {
    const newCategory = currentFilters.category === slug ? undefined : slug;
    onFilterChange({ ...currentFilters, category: newCategory });
  };

  // Toggle Accordion Danh mục
  const toggleExpand = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCats(prev =>
      prev.includes(id) ? prev.filter(catId => catId !== id) : [...prev, id]
    );
  };

  // 2. Chọn Thương hiệu (Theo brandSlug)
  const handleBrandChange = (slug: string) => {
    const newBrandSlug = currentFilters.brandSlug === slug ? undefined : slug;
    onFilterChange({ ...currentFilters, brandSlug: newBrandSlug });
  };

  // 3. Áp dụng Giá
  const applyPriceFilter = () => {
    const from = priceFrom ? Number(priceFrom) : undefined;
    const to = priceTo ? Number(priceTo) : undefined;
    onFilterChange({ ...currentFilters, priceFrom: from, priceTo: to });
  };

  // 4. Xóa bộ lọc
  const handleClear = () => {
    setPriceFrom('');
    setPriceTo('');
    onFilterChange({});
  };

  // --- RENDER HELPERS ---

  // Render cây danh mục đệ quy
  const renderCategoryItem = (cat: Category, level = 0) => {
    const isSelected = currentFilters.category === cat.slug;
    const hasChildren = cat.children && cat.children.length > 0;
    const isExpanded = expandedCats.includes(cat.id);

    return (
      <div key={cat.id} className="w-full select-none">
        <div
          className={cn(
            "flex items-center justify-between py-1.5 px-2 rounded-lg cursor-pointer transition text-sm mb-1",
            isSelected
              ? "bg-primary/10 text-primary font-bold"
              : "text-gray-600 hover:bg-gray-50 hover:text-primary",
            level > 0 && "ml-3 border-l-2 border-gray-100 pl-3" // Thụt lề visual
          )}
          onClick={() => handleCategoryChange(cat.slug)}
        >
          <span className="flex-1 truncate">{cat.name}</span>

          {hasChildren && (
            <button
              onClick={(e) => toggleExpand(cat.id, e)}
              className="p-1 text-gray-400 hover:text-primary rounded-full hover:bg-gray-200 transition"
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Render con */}
        {hasChildren && isExpanded && (
          <div className="ml-1">
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

        {/* === 1. DANH MỤC === */}
        <div>
          <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-3">Danh mục</h4>
          <div className="max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="h-6 bg-gray-100 rounded animate-pulse"></div>)}
              </div>
            ) : categories.length > 0 ? (
              categories.map(cat => renderCategoryItem(cat))
            ) : (
              <p className="text-xs text-gray-400 italic">Chưa có danh mục.</p>
            )}
          </div>
        </div>

        {/* === 2. KHOẢNG GIÁ === */}
        <div>
          <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-3">Khoảng giá (VNĐ)</h4>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="number"
              placeholder="Từ"
              value={priceFrom}
              onChange={(e) => setPriceFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              placeholder="Đến"
              value={priceTo}
              onChange={(e) => setPriceTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
            />
          </div>
          <button
            onClick={applyPriceFilter}
            className="w-full py-2 bg-blue-50 text-primary text-sm font-bold rounded-lg hover:bg-primary hover:text-white transition"
          >
            Áp dụng
          </button>
        </div>

        {/* === 3. THƯƠNG HIỆU === */}
        <div>
          <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-3">Thương hiệu</h4>

          <div className="max-h-[250px] overflow-y-auto pr-1 custom-scrollbar space-y-1">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="h-5 bg-gray-100 rounded animate-pulse"></div>)}
              </div>
            ) : brands.length > 0 ? (
              brands.map((brand) => {
                // Check selected dựa trên slug
                const isSelected = currentFilters.brandSlug === brand.slug;

                return (
                  <label key={brand.id} className="flex items-center gap-3 cursor-pointer group py-1 hover:bg-gray-50 rounded px-1 transition">
                    <div className={cn(
                      "w-4 h-4 border rounded flex items-center justify-center transition shrink-0",
                      isSelected
                        ? "bg-primary border-primary"
                        : "border-gray-300 bg-white group-hover:border-primary"
                    )}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>

                    <input
                      type="checkbox"
                      className="hidden"
                      checked={isSelected}
                      onChange={() => handleBrandChange(brand.slug)}
                    />

                    <span className={cn(
                      "text-sm transition line-clamp-1",
                      isSelected ? "text-primary font-medium" : "text-gray-600 group-hover:text-primary"
                    )}>
                      {brand.name}
                    </span>
                  </label>
                );
              })
            ) : (
              <p className="text-xs text-gray-400 italic">Chưa có thương hiệu.</p>
            )}
          </div>
        </div>

        {/* === ACTIONS === */}
        <button
          onClick={handleClear}
          className="w-full py-2.5 border border-red-200 text-red-500 text-sm font-medium rounded-lg hover:bg-red-50 transition flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" /> Xóa bộ lọc
        </button>

      </div>
    </div>
  );
};

export default ProductFilter;