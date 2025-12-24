import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, User as UserIcon, LogOut, ChevronDown, FileText, UserCircle } from 'lucide-react'; // Thêm icon
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { clearAuth } from '../../store/slices/authSlice'; // Action đăng xuất (clearAuth)
import categoryService from '../../api/categoryService';
import { type Category } from '../../types/category.types';
import CategoryMenuItem from '../common/CategoryMenuItem';
import identityService from '../../api/identityService';
import { useModal } from '../../context/ModalContext'; // Import Modal
import AsyncImage from '../common/AsyncImage'; // Import AsyncImage để hiện Avatar

const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { openModal } = useModal(); // Sử dụng Modal
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { totalQuantity } = useAppSelector((state) => state.cart);

  const [productCategories, setProductCategories] = useState<Category[]>([]);
  const [articleCategories, setArticleCategories] = useState<Category[]>([]);

  // ... (Phần useEffect fetchCategories giữ nguyên) ...
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        // Gọi song song 2 API để tiết kiệm thời gian
        const [productRes, blogRes] = await Promise.all([
          categoryService.getCategoriesTree(),   // API cũ (cho sản phẩm)
          categoryService.getBlogCategories()    // API mới (cho blog)
        ]);

        // 1. Xử lý Danh mục Sản phẩm
        // (Vẫn giữ logic lọc phòng hờ API cũ trả về hỗn hợp, hoặc bỏ filter nếu API đã tách sạch)
        const pData: any = productRes;
        const pList = pData.data || pData.result || [];

        if (Array.isArray(pList)) {
          // Lọc lấy type PRODUCT (hoặc lấy hết nếu API /categories chỉ trả về product)
          const pCats = pList.filter((c: Category) => !c.type || c.type.name === 'PRODUCT');
          setProductCategories(pCats);
        }

        // 2. Xử lý Danh mục Blog (Dùng API mới)
        const bData: any = blogRes;
        const bList = bData.data || bData.result || [];

        if (Array.isArray(bList)) {
          setArticleCategories(bList);
        }

      } catch (error) {
        console.error("Lỗi tải menu:", error);
      }
    };

    fetchMenuData();
  }, []);

  const handleLogout = () => {
    openModal(
      'confirm', // Loại modal
      'Đăng xuất', // Tiêu đề
      'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?', // Nội dung
      async () => {
        // Hành động khi bấm "Có"
        try {
          await identityService.logout();
        } catch (error) {
          console.warn("Logout failed", error);
        } finally {
          dispatch(clearAuth());
          navigate('/login');
        }
      },
      'Có, Đăng xuất', // Label nút Confirm
      'Không'          // Label nút Cancel
    );
  };

  const handleCartClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault(); // Chặn chuyển trang
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md font-sans">
      {/* Top Bar*/}
      <div className="bg-primary text-white text-xs py-1 px-4 text-center hidden md:block">
        Hotline tư vấn: 1900 123 456 - Miễn phí vận chuyển đơn hàng trên 500k
      </div>

      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">

          {/* Logo & Menu Danh mục (Giữ nguyên) */}
          <div className="flex items-center gap-6">
            <Link to="/" className="text-2xl font-bold text-primary flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">P</div>
              <span className="hidden sm:inline-block">Pharmacy</span>
            </Link>

            {/* ===> MENU DESKTOP <=== */}
            <div className="hidden lg:flex items-center gap-6">

              {/* Menu Sản phẩm (Giữ nguyên) */}
              <div className="group relative h-10 flex items-center">
                <Link to="/products" className="font-bold text-gray-700 hover:text-primary flex items-center gap-1 cursor-pointer">
                  Danh mục thuốc <ChevronDown className="w-4 h-4" />
                </Link>
                <div className="absolute top-full left-0 mt-0 pt-2 hidden group-hover:block">
                  <div className="bg-white shadow-xl border border-gray-100 rounded-lg min-w-[240px] py-2">
                    {productCategories.map(cat => <CategoryMenuItem key={cat.id} category={cat} depth={1} />)}
                  </div>
                </div>
              </div>

              {/* 2. Menu Góc sức khỏe (Dùng articleCategories từ API mới) */}
              <div className="group relative h-10 flex items-center">
                <Link to="/articles" className="font-medium text-gray-700 hover:text-primary flex items-center gap-1 cursor-pointer">
                  Góc sức khỏe <ChevronDown className="w-4 h-4" />
                </Link>
                <div className="absolute top-full left-0 mt-0 pt-2 hidden group-hover:block">
                  <div className="bg-white shadow-xl border border-gray-100 rounded-lg min-w-[240px] py-2">
                    {articleCategories.length > 0 ? (
                      articleCategories.map(cat => (
                        <CategoryMenuItem key={cat.id} category={cat} depth={1} />
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-gray-400 italic">Đang cập nhật...</div>
                    )}
                  </div>
                </div>
              </div>

              {/* ===> THÊM MỚI: MENU LIÊN HỆ <=== */}
              <Link
                to="/contact"
                className="font-medium text-gray-700 hover:text-primary flex items-center gap-1 h-10 transition-colors"
              >
                Liên hệ
              </Link>

            </div>
          </div>

          {/* Search Bar (Giữ nguyên) */}
          <div className="flex-1 max-w-sm relative hidden sm:block ml-auto">
            <input type="text" placeholder="Tìm thuốc, thực phẩm chức năng..." className="w-full pl-4 pr-10 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-primary text-sm" />
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">

            {/* Giỏ hàng */}
            <Link to="/cart" onClick={handleCartClick} className="relative group p-2 hover:bg-gray-100 rounded-full transition">
              <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-primary" />
              {totalQuantity > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {totalQuantity}
                </span>
              )}
            </Link>

            {/* ===> PHẦN AUTHENTICATION (USER MENU) <=== */}
            {isAuthenticated && user ? (
              <div className="relative group py-2"> {/* Thêm py-2 vào thẻ cha để mở rộng vùng hover */}

                {/* Nút hiển thị User (Trigger) */}
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

                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-0 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden hidden group-hover:block animate-in fade-in zoom-in-95 duration-200 z-50">

                  {/* ===> QUAN TRỌNG: LỚP ĐỆM VÔ HÌNH (INVISIBLE BRIDGE) <=== 
                      Lớp này nằm đè lên khoảng trống margin, giúp chuột không bị trượt ra ngoài.
                  */}
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
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition text-left"
                    >
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Nếu chưa đăng nhập
              <div className="flex items-center gap-3">
                <Link to="/login" className="hidden sm:block text-sm font-medium text-gray-600 hover:text-primary transition">Đăng nhập</Link>
                <Link to="/register" className="px-4 py-2 text-sm font-bold text-white bg-primary rounded-full hover:bg-blue-600 transition shadow-md shadow-blue-200">
                  Đăng ký
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;