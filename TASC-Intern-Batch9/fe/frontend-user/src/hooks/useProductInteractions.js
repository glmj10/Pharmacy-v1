import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useAuthAction } from './useAuthAction'; 
import { wishlistService } from '../services/wishlistService';
import { toast } from 'react-toastify';

const useProductInteractions = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { executeWithAuth } = useAuthAction();

  const [wishlistItems, setWishlistItems] = useState([]);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems([]);
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      setWishlistItems([]);
      return;
    }
    
    try {
      const response = await wishlistService.getWishlist();
      if (response?.data && Array.isArray(response.data)) {
        setWishlistItems(response.data.map(item => item.productId || item.id));
      } else if (Array.isArray(response)) {
        setWishlistItems(response.map(item => item.productId || item.id));
      } else {
        setWishlistItems([]);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setWishlistItems([]);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleProductClick = useCallback((productSlug) => {
    navigate(`/products/${productSlug}`);
  }, [navigate]);

  const handleAddToCart = executeWithAuth(async (productId, quantity = 1) => {
    try {
      await addToCart(productId, quantity);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  });

  const handleWishlistToggle = executeWithAuth(async (productOrId) => {
    try {
      let productId;
      
      if (typeof productOrId === 'object' && productOrId !== null) {
        productId = productOrId.id;
        if (!productId || productId === undefined || productId === null) {
          console.error('Invalid product object (missing id):', productOrId);
          toast.error('Không thể xác định sản phẩm. Vui lòng thử lại.');
          return;
        }
      } else if (typeof productOrId === 'number' || (typeof productOrId === 'string' && !isNaN(Number(productOrId)))) {
        productId = Number(productOrId);
        if (!productId || isNaN(productId)) {
          console.error('Invalid product ID:', productOrId);
          toast.error('Không thể xác định sản phẩm. Vui lòng thử lại.');
          return;
        }
      } else {
        console.error('Invalid parameter - expected product object or product ID:', productOrId);
        toast.error('Không thể xác định sản phẩm. Vui lòng thử lại.');
        return;
      }
      
      const isInWishlist = wishlistItems.includes(productId);

      if (isInWishlist) {
        await wishlistService.removeFromWishlist(productId);
        setWishlistItems(prev => prev.filter(id => id !== productId));
        toast.success('Đã xóa sản phẩm khỏi danh sách yêu thích!');
      } else {
        await wishlistService.addToWishlist(productId);
        setWishlistItems(prev => [...prev, productId]);
        toast.success('Đã thêm sản phẩm vào danh sách yêu thích!');
      }
    } catch (error) {
      let msg = 'Có lỗi khi cập nhật danh sách yêu thích.';
      if (error?.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error?.response?.data?.details && Array.isArray(error.response.data.details)) {
        msg = error.response.data.details.map(d => d.message).join(', ');
      } else if (error?.message) {
        msg = error.message;
      }
      toast.error(msg);
      console.error('Error toggling wishlist:', error);
    }
  });

  const addToWishlist = executeWithAuth(async (productId) => {
    try {
      if (!productId || productId === undefined || productId === null) {
        console.error('Invalid product ID:', productId);
        toast.error('Không thể xác định sản phẩm. Vui lòng thử lại.');
        return;
      }
      
      await wishlistService.addToWishlist(productId);
      setWishlistItems(prev => [...prev, productId]);
      toast.success('Đã thêm sản phẩm vào danh sách yêu thích!');
    } catch (error) {
      let msg = 'Có lỗi khi thêm sản phẩm vào danh sách yêu thích.';
      if (error?.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error?.response?.data?.details && Array.isArray(error.response.data.details)) {
        msg = error.response.data.details.map(d => d.message).join(', ');
      } else if (error?.message) {
        msg = error.message;
      }
      toast.error(msg);
      console.error('Error adding to wishlist:', error);
    }
  });

  const removeFromWishlist = executeWithAuth(async (productId) => {
    try {
      if (!productId || productId === undefined || productId === null) {
        console.error('Invalid product ID:', productId);
        toast.error('Không thể xác định sản phẩm. Vui lòng thử lại.');
        return;
      }
      
      await wishlistService.removeFromWishlist(productId);
      setWishlistItems(prev => prev.filter(id => id !== productId));
      toast.success('Đã xóa sản phẩm khỏi danh sách yêu thích!');
    } catch (error) {
      let msg = 'Có lỗi khi xóa sản phẩm khỏi danh sách yêu thích.';
      if (error?.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error?.response?.data?.details && Array.isArray(error.response.data.details)) {
        msg = error.response.data.details.map(d => d.message).join(', ');
      } else if (error?.message) {
        msg = error.message;
      }
      toast.error(msg);
      console.error('Error removing from wishlist:', error);
    }
  });

  return {
    wishlistItems,
    handleProductClick,
    handleAddToCart,
    handleWishlistToggle,
    addToWishlist,
    removeFromWishlist,
    fetchWishlist 
  };
};

export { useProductInteractions };
export default useProductInteractions;