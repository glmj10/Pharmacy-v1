package com.pharmacy_backend.product_service.service;


import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.product_service.dto.response.ProductResponse;

import java.util.List;

public interface WishlistService {
    ApiResponse<List<ProductResponse>> getMyWishlist();
    ApiResponse<Void> addProductToWishlist(Long productId);
    ApiResponse<Void> removeProductFromWishlist(Long wishlistId);
    ApiResponse<Void> clearWishlist();
}
