import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAppSelector } from '../store/hooks';
import wishlistService from '../api/wishlistService';

interface WishlistContextType {
  /** Set chứa id của các sản phẩm đang yêu thích */
  wishlistIds: Set<number>;
  /** Toggle yêu thích: thêm nếu chưa có, xóa nếu đã có */
  toggleWishlist: (productId: number) => Promise<void>;
  /** Đang load lần đầu hay không */
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlistIds: new Set(),
  toggleWishlist: async () => {},
  isLoading: false,
});

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Load wishlist IDs khi user đăng nhập
  useEffect(() => {
    if (!isAuthenticated) {
      setWishlistIds(new Set());
      return;
    }

    const fetchWishlist = async () => {
      setIsLoading(true);
      try {
        // Lấy tối đa 200 item để build Set IDs
        const res: any = await wishlistService.getMyWishlist(1, 200);
        const content: any[] = res.data?.content ?? res.result?.content ?? [];
        const ids = content.map((p: any) => p.id as number);
        setWishlistIds(new Set(ids));
      } catch (error) {
        console.error('Failed to fetch wishlist', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, [isAuthenticated]);

  const toggleWishlist = useCallback(
    async (productId: number) => {
      if (!isAuthenticated) return;

      const isInWishlist = wishlistIds.has(productId);

      // Optimistic update
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (isInWishlist) {
          next.delete(productId);
        } else {
          next.add(productId);
        }
        return next;
      });

      try {
        if (isInWishlist) {
          await wishlistService.removeFromWishlist([productId]);
        } else {
          await wishlistService.addToWishlist(productId);
        }
      } catch (error) {
        // Hoàn tác nếu API lỗi
        setWishlistIds((prev) => {
          const next = new Set(prev);
          if (isInWishlist) {
            next.add(productId);
          } else {
            next.delete(productId);
          }
          return next;
        });
        throw error;
      }
    },
    [isAuthenticated, wishlistIds]
  );

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggleWishlist, isLoading }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
