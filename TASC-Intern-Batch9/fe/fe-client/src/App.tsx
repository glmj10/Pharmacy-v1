import { Routes, Route } from 'react-router-dom';
import ClientLayout from './components/layout/ClientLayout';
import Login from './pages/Login';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import ProductDetail from './pages/ProductDetail'; // Import mới
import Products from './pages/Products'; // <== Import trang mới
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import VerifyAccount from './pages/VerifyAccount';
import Contact from './pages/Contact';
import SessionManager from './components/auth/SessionManager';
import PaymentResult from './pages/PaymentResult';
import ArticleDetail from './pages/ArticleDetail';
import Blog from './pages/Blog';
import PromotionDetail from './pages/PromotionDetail';


const NotFound = () => <div className="p-10 text-center text-red-500">404 - Không tìm thấy trang</div>;

function App() {
  return (
    <>
      <SessionManager />

      <Routes>
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<Home />} />
          <Route path="categories/:slug" element={<Products />} />
          <Route path="products" element={<Products />} />
          {/* Route chi tiết sản phẩm: slug là tham số động */}
          <Route path="products/:slug" element={<ProductDetail />} />
          <Route path="register" element={<Register />} /> {/* <== Route này */}
          <Route path="verify-account" element={<VerifyAccount />} />
          <Route path="contact" element={<Contact />} />

          <Route path="login" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="profile" element={<Profile />} /> {/* Có thể bọc ProtectedRoute nếu cần */}
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-success" element={<OrderSuccess />} />

          <Route path="payment/vnpay-return" element={<PaymentResult />} />

          <Route path="articles" element={<Blog />} />
          <Route path="articles/:slug" element={<ArticleDetail />} />

          <Route path="promotions/:id" element={<PromotionDetail />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>

  );
}

export default App;