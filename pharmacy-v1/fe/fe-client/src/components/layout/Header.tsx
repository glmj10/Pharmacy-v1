import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShoppingCart, Search, Menu, X, User as UserIcon, LogOut,
  ChevronDown, ChevronRight, FileText, UserCircle, Ticket, Phone
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { clearAuth } from '../../store/slices/authSlice';
import { clearAuthHeader } from '../../api/axiosClient';
import categoryService from '../../api/categoryService';
import { type Category } from '../../types/category.types';
import CategoryMenuItem from '../common/CategoryMenuItem';
import identityService from '../../api/identityService';
import { useModal } from '../../context/ModalContext';
import AsyncImage from '../common/AsyncImage';
import { cn } from '../../lib/utils';


const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { openModal } = useModal();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { totalQuantity } = useAppSelector((state) => state.cart);

  const [productCategories, setProductCategories] = useState<Category[]>([]);
  const [articleCategories, setArticleCategories] = useState<Category[]>([]);
  const [keyword, setKeyword] = useState('');
  const [searchParams] = useSearchParams();

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileProductOpen, setMobileProductOpen] = useState(false);
  const [mobileBlogOpen, setMobileBlogOpen] = useState(false);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const [productRes, blogRes] = await Promise.all([
          categoryService.getCategoriesTree(),
          categoryService.getBlogCategories()
        ]);

        const pData: any = productRes;
        const pList = pData.data || pData.result || [];
        if (Array.isArray(pList)) {
          setProductCategories(pList.filter((c: Category) => !c.type || c.type.name === 'PRODUCT'));
        }

        const bData: any = blogRes;
        const bList = bData.data || bData.result || [];
        if (Array.isArray(bList)) setArticleCategories(bList);

      } catch (error) {
        console.error("Lỗi tải menu:", error);
      }
    };
    fetchMenuData();
  }, []);

  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) setKeyword(searchFromUrl);
  }, [searchParams]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [searchParams]);

  // Prevent body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const handleSearch = () => {
    if (keyword.trim()) {
      navigate(`/products?search=${encodeURIComponent(keyword.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    openModal(
      'confirm',
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?',
      async () => {
        try { await identityService.logout(); } catch { /* ignore */ } finally {
          clearAuthHeader();
          dispatch(clearAuth());
          navigate('/login');
        }
      },
      'Có, Đăng xuất',
      'Không'
    );
  };

  const handleCartClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) { e.preventDefault(); navigate('/login'); }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-md font-sans">
        {/* Top Bar */}
        <div className="bg-primary text-white text-xs py-1 px-4 text-center hidden md:block">
          Hotline tư vấn: 1900 123 456 - Miễn phí vận chuyển đơn hàng trên 500k
        </div>

        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">

            {/* Logo */}
            <Link to="/" className="text-2xl font-bold text-primary flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">P</div>
              <span className="hidden sm:inline-block">Pharmacy</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-6">
              <div className="group relative h-10 flex items-center">
                <Link to="/products" className="font-bold text-gray-700 hover:text-primary flex items-center gap-1">
                  Danh mục thuốc <ChevronDown className="w-4 h-4" />
                </Link>
                <div className="absolute top-full left-0 mt-0 pt-2 hidden group-hover:block">
                  <div className="bg-white shadow-xl border border-gray-100 rounded-lg min-w-[240px] py-2">
                    {productCategories.map(cat => (
                      <CategoryMenuItem key={cat.id} category={cat} depth={1} rootType="PRODUCT" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="group relative h-10 flex items-center">
                <Link to="/blogs" className="font-medium text-gray-700 hover:text-primary flex items-center gap-1">
                  Góc sức khỏe <ChevronDown className="w-4 h-4" />
                </Link>
                <div className="absolute top-full left-0 mt-0 pt-2 hidden group-hover:block">
                  <div className="bg-white shadow-xl border border-gray-100 rounded-lg min-w-[240px] py-2">
                    {articleCategories.map(cat => (
                      <CategoryMenuItem key={cat.id} category={cat} depth={1} rootType="BLOG" />
                    ))}
                  </div>
                </div>
              </div>

              <Link to="/vouchers" className="font-bold text-orange-600 hover:text-orange-700 hover:bg-orange-50 px-3 py-1.5 rounded-full flex items-center gap-2 h-10 transition-all">
                <Ticket className="w-5 h-5 fill-current" /> Mã giảm giá
              </Link>

              <Link to="/contact" className="font-medium text-gray-700 hover:text-primary flex items-center gap-1 h-10 transition-colors">
                Liên hệ
              </Link>
            </div>

            {/* Search Bar - Desktop */}
            {/* <div className="flex-1 max-w-sm relative hidden lg:block">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tìm thuốc, thực phẩm chức năng..."
                className="w-full pl-4 pr-10 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-primary text-sm transition-all"
              />
              <button onClick={handleSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition">
                <Search className="w-4 h-4" />
              </button>
            </div> */}

            {/* Actions */}
            <div className="flex items-center gap-2">

              {/* Mobile Search Icon */}
              <button
                className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition"
                onClick={() => { setIsMobileMenuOpen(true); }}
                aria-label="Tìm kiếm"
              >
                <Search className="w-5 h-5 text-gray-700" />
              </button>

              {/* Cart */}
              <Link to="/cart" onClick={handleCartClick} className="relative group p-2 hover:bg-gray-100 rounded-full transition">
                <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-primary" />
                {totalQuantity > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {totalQuantity}
                  </span>
                )}
              </Link>

              {/* Desktop User Menu */}
              {isAuthenticated && user ? (
                <div className="relative group py-2 hidden lg:block">
                  <button className="flex items-center gap-2 hover:bg-gray-50 p-1 pr-3 rounded-full transition border border-transparent hover:border-gray-200">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-primary font-bold overflow-hidden border border-blue-200">
                      {user.profilePic ? (
                        <AsyncImage src={user.profilePic} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm">{user.username?.[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-xs text-gray-500">Xin chào,</p>
                      <p className="text-sm font-bold text-gray-700 max-w-[100px] truncate leading-none">{user.username}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                  </button>

                  <div className="absolute right-0 top-full mt-0 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden hidden group-hover:block animate-in fade-in zoom-in-95 duration-200 z-50">
                    <div className="absolute -top-4 left-0 w-full h-4 bg-transparent"></div>
                    <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                      <p className="font-bold text-gray-800 truncate">{user.username}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="p-2">
                      <Link to="/profile" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-primary rounded-lg transition">
                        <UserCircle className="w-4 h-4" /> Hồ sơ cá nhân
                      </Link>
                      <Link to="/profile?tab=orders" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-primary rounded-lg transition">
                        <FileText className="w-4 h-4" /> Đơn hàng của tôi
                      </Link>
                    </div>
                    <div className="p-2 border-t border-gray-50">
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition text-left">
                        <LogOut className="w-4 h-4" /> Đăng xuất
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="hidden lg:flex items-center gap-3">
                  <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-primary transition">Đăng nhập</Link>
                  <Link to="/register" className="px-4 py-2 text-sm font-bold text-white bg-primary rounded-full hover:bg-blue-600 transition shadow-md shadow-blue-200">
                    Đăng ký
                  </Link>
                </div>
              )}

              {/* Hamburger - Mobile only */}
              <button
                className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Mở menu"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[999] lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute top-0 left-0 h-full w-[85%] max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-primary text-white">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold flex items-center gap-2">
                <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-primary font-bold text-xs">P</div>
                Pharmacy
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1.5 hover:bg-white/20 rounded-full transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tìm thuốc, thực phẩm chức năng..."
                  className="w-full pl-4 pr-10 py-2.5 rounded-full border border-gray-300 focus:outline-none focus:border-primary text-sm"
                />
                <button onClick={handleSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 overflow-y-auto py-2">

              {/* Danh mục thuốc */}
              <div>
                <button
                  onClick={() => setMobileProductOpen(v => !v)}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-gray-800 font-bold hover:bg-gray-50 transition"
                >
                  <span>Danh mục thuốc</span>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", mobileProductOpen && "rotate-180")} />
                </button>
                {mobileProductOpen && (
                  <div className="pl-4 bg-gray-50 border-t border-gray-100">
                    {productCategories.map(cat => (
                      <Link
                        key={cat.id}
                        to={`/products?category=${cat.slug}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:text-primary border-b border-gray-100 last:border-0"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" /> {cat.name}
                      </Link>
                    ))}
                    <Link
                      to="/products"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-primary"
                    >
                      Xem tất cả →
                    </Link>
                  </div>
                )}
              </div>

              {/* Góc sức khỏe */}
              <div className="border-t border-gray-100">
                <button
                  onClick={() => setMobileBlogOpen(v => !v)}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  <span>Góc sức khỏe</span>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", mobileBlogOpen && "rotate-180")} />
                </button>
                {mobileBlogOpen && (
                  <div className="pl-4 bg-gray-50 border-t border-gray-100">
                    {articleCategories.map(cat => (
                      <Link
                        key={cat.id}
                        to={`/blogs?category=${cat.slug}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:text-primary border-b border-gray-100 last:border-0"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" /> {cat.name}
                      </Link>
                    ))}
                    <Link
                      to="/blogs"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-primary"
                    >
                      Xem tất cả →
                    </Link>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100">
                <Link
                  to="/vouchers"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-5 py-3.5 text-orange-600 font-bold hover:bg-orange-50 transition"
                >
                  <Ticket className="w-5 h-5" /> Mã giảm giá
                </Link>
              </div>

              <div className="border-t border-gray-100">
                <Link
                  to="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-5 py-3.5 text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  <Phone className="w-5 h-5 text-gray-400" /> Liên hệ
                </Link>
              </div>

              {/* Auth links for mobile (when logged in) */}
              {isAuthenticated && user && (
                <>
                  <div className="border-t border-gray-200 mt-2 pt-2">
                    <div className="px-5 py-3 flex items-center gap-3 bg-blue-50/50">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-primary font-bold overflow-hidden border border-blue-200 shrink-0">
                        {user.profilePic ? (
                          <AsyncImage src={user.profilePic} className="w-full h-full object-cover" />
                        ) : (
                          <span>{user.username?.[0]?.toUpperCase()}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 text-sm truncate">{user.username}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <UserCircle className="w-4 h-4 text-gray-400" /> Hồ sơ cá nhân
                    </Link>
                    <Link
                      to="/profile?tab=orders"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
                    >
                      <FileText className="w-4 h-4 text-gray-400" /> Đơn hàng của tôi
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
                    >
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </div>
                </>
              )}
            </nav>

            {/* Footer auth buttons (when logged out) */}
            {!isAuthenticated && (
              <div className="p-4 border-t border-gray-200 grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2.5 text-center text-sm font-bold text-primary border-2 border-primary rounded-xl hover:bg-blue-50 transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2.5 text-center text-sm font-bold text-white bg-primary rounded-xl hover:bg-blue-600 transition shadow-md"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Hotline */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center gap-2 text-xs text-gray-500">
              <Phone className="w-3.5 h-3.5 text-primary" /> Hotline: <span className="font-bold text-gray-700">1900 123 456</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;