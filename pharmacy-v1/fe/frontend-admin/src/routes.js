import React from 'react'

const Profile = React.lazy(() => import('./views/profile/Profile'))

// Admin Views
const AdminDashboard = React.lazy(() => import('./views/dashboard/AdminDashboard'))
const ProductList = React.lazy(() => import('./views/admin/products/ProductList'))
const ProductForm = React.lazy(() => import('./views/admin/products/ProductForm'))
const OrderList = React.lazy(() => import('./views/admin/orders/OrderList'))
const UserList = React.lazy(() => import('./views/admin/users/UserList'))
const CategoryList = React.lazy(() => import('./views/admin/categories/CategoryList'))
const BrandList = React.lazy(() => import('./views/admin/brands/BrandList'))
const ContactList = React.lazy(() => import('./views/admin/contacts/ContactList'))
const BlogList = React.lazy(() => import('./views/admin/blogs/BlogList'))
const BlogForm = React.lazy(() => import('./views/admin/blogs/BlogForm'))
const VoucherList = React.lazy(() => import('./views/admin/vouchers/VoucherList'))
const PromotionList = React.lazy(() => import('./views/admin/promotions/PromotionList'))
const PromotionItemList = React.lazy(() => import('./views/admin/promotions/PromotionItemList'))
const BannerList = React.lazy(() => import('./views/admin/banners/BannerList'))
const BannerForm = React.lazy(() => import('./views/admin/banners/BannerForm'))


const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/profile', name: 'Profile', element: Profile },
  
  // Admin Routes
  { path: '/', name: 'Admin', element: AdminDashboard, exact: true },
  { path: '/dashboard', name: 'Admin Dashboard', element: AdminDashboard },
  
  // Product Management
  { path: '/products/list', name: 'Quản lý sản phẩm', element: ProductList, exact: true },
  { path: '/products/create', name: 'Thêm sản phẩm', element: ProductForm },
  { path: '/products/edit/:id', name: 'Chỉnh sửa sản phẩm', element: ProductForm },
  
  // Order Management
  { path: '/orders', name: 'Quản lý đơn hàng', element: OrderList },
  
  // User Management
  { path: '/users', name: 'Quản lý người dùng', element: UserList },
  
  // Category Management
  { path: '/categories', name: 'Quản lý danh mục', element: CategoryList },
  
  // Brand Management
  { path: '/brands', name: 'Quản lý thương hiệu', element: BrandList },
  
  // Contact Management
  { path: '/contacts', name: 'Quản lý liên hệ', element: ContactList },
  
  // Blog Management
  { path: '/blogs', name: 'Quản lý bài viết', element: BlogList, exact: true },
  { path: '/blogs/list', name: 'Danh sách bài viết', element: BlogList },
  { path: '/blogs/create', name: 'Thêm bài viết', element: BlogForm },
  { path: '/blogs/edit/:id', name: 'Chỉnh sửa bài viết', element: BlogForm },
  
  // Voucher Management
  { path: '/vouchers', name: 'Quản lý Voucher', element: VoucherList },
  
  // Promotion Management
  { path: '/promotions', name: 'Quản lý Khuyến mãi', element: PromotionList, exact: true },
  { path: '/promotions/:eventId/items', name: 'Sản phẩm khuyến mãi', element: PromotionItemList },
  
  // Banner Management
  { path: '/banners', name: 'Quản lý Banner', element: BannerList, exact: true },
  { path: '/banners/create', name: 'Thêm Banner', element: BannerForm },
  { path: '/banners/edit/:id', name: 'Chỉnh sửa Banner', element: BannerForm },
  
]

export default routes
