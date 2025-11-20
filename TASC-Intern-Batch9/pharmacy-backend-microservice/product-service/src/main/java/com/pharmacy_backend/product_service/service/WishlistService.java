package com.project.pharmacy.service;


import com.project.pharmacy.dto.response.ApiResponse;
import com.project.pharmacy.dto.response.ProductResponse;
import com.project.pharmacy.entity.Product;

import java.util.List;

public interface WishlistService {
    ApiResponse<List<ProductResponse>> getMyWishlist();
    ApiResponse<Void> addProductToWishlist(Long productId);
    ApiResponse<Void> removeProductFromWishlist(Long wishlistId);
    ApiResponse<Void> clearWishlist();
    ApiResponse<Void> addAllToCart();
}
