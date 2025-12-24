import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Loader2, ChevronDown, ArrowUp } from 'lucide-react'; // Thêm ArrowUp

import ProductFilter from '../components/product/ProductFilter';
import ProductCard from '../components/product/ProductCard';
import productService from '../api/productService';
import type { Product, ProductFilterRequest } from '../types/product.types';
import { cn } from '../lib/utils';

const Products: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  // State Filter
  const [filters, setFilters] = useState<ProductFilterRequest>({
    title: searchParams.get('search') || undefined,
    category: searchParams.get('category') || undefined,
    brand: searchParams.get('brand') || undefined,
    priceFrom: searchParams.get('priceFrom') ? Number(searchParams.get('priceFrom')) : undefined,
    priceTo: searchParams.get('priceTo') ? Number(searchParams.get('priceTo')) : undefined,
    isAscending: searchParams.get('sort') === 'asc' ? true : searchParams.get('sort') === 'desc' ? false : undefined,
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true); 
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Reset khi đổi filter
  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
    setInitialLoading(true);
  }, [filters]);

 useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const LIMIT = 12;
        
        // 1. Gọi API
        // axiosClient trả về body response (nhờ interceptor), tức là ApiResponse
        const response: any = await productService.getAll({
          ...filters,
          page: page, 
          limit: LIMIT
        });

        // 2. Log ra để kiểm tra tên trường thực tế (Rất quan trọng!)
        console.log("Full API Response:", response);

        // 3. Truy cập vào PageResponse
        // Theo cấu trúc bạn gửi: ApiResponse.data -> chứa PageResponse
        const pageData = response.data; 

        // 4. Lấy danh sách từ 'content'
        const rawList = pageData?.content || [];
        const totalPages = pageData?.totalPages || 1;

        // 5. MAPPING DỮ LIỆU (FIX LỖI QUAN TRỌNG NHẤT)
        // Chuyển đổi từ Java Field sang Frontend Field
        const mappedProducts: Product[] = rawList.map((item: any) => ({
          id: item.id,
          // Nếu backend trả 'name', map sang 'title'
          title: item.name || item.title || "Sản phẩm chưa đặt tên",
          
          priceNew: Number(item.price || item.salePrice || item.priceNew || 0),
          
          // Nếu backend trả 'originalPrice', map sang 'price_old'
          priceOld: Number(item.originalPrice || item.priceOld || 0),
          
          // Nếu backend trả 'image', map sang 'thumbnail'
          thumbnail: item.image || item.thumbnail || "https://via.placeholder.com/300",
          
          slug: item.slug || `product-${item.id}`,
          quantity: item.quantity || 0,
          active: item.active !== false // Mặc định true nếu ko có
        }));

        setProducts(prev => {
          if (page === 1) return mappedProducts;
          return [...prev, ...mappedProducts];
        });

        // Logic check hasNext
        if (page >= totalPages) {
          setHasMore(false);
        }

      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
        setHasMore(false);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    };

    fetchProducts();
  }, [filters, page]);

  // ... (Phần logic scroll, filter change, sort change giữ nguyên như cũ)
  
  // Handler thay đổi Filter
  const handleFilterChange = (newFilters: ProductFilterRequest) => {
    setFilters(newFilters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    let isAscending: boolean | undefined = undefined;
    if (value === 'price-asc') isAscending = true;
    if (value === 'price-desc') isAscending = false;
    handleFilterChange({ ...filters, isAscending });
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  };

    useEffect(() => {
    const handleScroll = () => {
      // Nếu cuộn quá 300px thì hiện nút
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hàm cuộn lên đầu trang
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 relative">
      <div className="container mx-auto px-4">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Tất cả sản phẩm</h1>
            <p className="text-sm text-gray-500 mt-1">Danh sách sản phẩm</p>
          </div>

          <div className="flex items-center gap-4">
            <button 
              className="md:hidden px-4 py-2 bg-white border border-gray-200 rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm"
              onClick={() => setShowMobileFilter(!showMobileFilter)}
            >
              <SlidersHorizontal className="w-4 h-4" /> Bộ lọc
            </button>

            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
              <span className="text-sm text-gray-500 hidden sm:inline">Sắp xếp:</span>
              <select 
                className="text-sm font-medium text-slate-800 bg-transparent outline-none cursor-pointer"
                onChange={handleSortChange}
                value={filters.isAscending === true ? 'price-asc' : filters.isAscending === false ? 'price-desc' : 'default'}
              >
                <option value="default">Mới nhất</option>
                <option value="price-asc">Giá: Thấp đến Cao</option>
                <option value="price-desc">Giá: Cao đến Thấp</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start relative">
          
          {/* ===> SIDEBAR STICKY (BỘ LỌC ĐI THEO) <=== */}
          <aside className={cn(
            "w-full md:w-1/4 md:block",
            showMobileFilter ? "block" : "hidden",
            // ===> SỬA TẠI ĐÂY <===
            // 1. Chuyển sticky và top-24 ra thẻ aside này
            // 2. Thêm 'h-fit' hoặc 'self-start' để nó không bị kéo giãn
            "sticky top-24 h-fit self-start" 
          )}>
            
            {/* Thẻ div bên trong bỏ sticky đi, chỉ giữ lại transition nếu muốn */}
            <div className="transition-all duration-300">
              <ProductFilter currentFilters={filters} onFilterChange={handleFilterChange} />
            </div>
          </aside>

          {/* Main List */}
          <main className="flex-1 w-full min-h-[500px]">
            {initialLoading && page === 1 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-80 bg-gray-200 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, index) => (
                  <ProductCard key={`${product.id}-${index}`} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center">
                 <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <SlidersHorizontal className="w-8 h-8 text-gray-400" />
                 </div>
                 <h3 className="text-lg font-bold text-gray-800 mb-2">Không tìm thấy sản phẩm</h3>
                 <p className="text-gray-500 mb-6">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
                 <button onClick={() => handleFilterChange({})} className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 transition">
                    Xóa bộ lọc
                 </button>
              </div>
            )}

            <div className="mt-10 text-center">
              {hasMore && products.length > 0 ? (
                <button 
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="group px-8 py-3 bg-white border border-gray-300 text-slate-700 font-medium rounded-full hover:bg-gray-50 hover:border-primary hover:text-primary transition-all shadow-sm active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed min-w-[200px]"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" /> Đang tải...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Hiển thị thêm <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                    </span>
                  )}
                </button>
              ) : (
                !initialLoading && products.length > 0 && (
                  <span className="text-gray-400 text-sm">Đã hiển thị tất cả sản phẩm</span>
                )
              )}
            </div>
          </main>
        </div>
      </div>

      {/* ===> NÚT BACK TO TOP <=== */}
      <button
        onClick={scrollToTop}
        className={cn(
          "fixed bottom-8 right-8 p-3 rounded-full bg-primary text-white shadow-lg hover:bg-blue-600 hover:-translate-y-1 transition-all duration-300 z-50",
          showBackToTop ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-4"
        )}
        title="Lên đầu trang"
      >
        <ArrowUp className="w-6 h-6" />
      </button>

    </div>
  );
};

export default Products;