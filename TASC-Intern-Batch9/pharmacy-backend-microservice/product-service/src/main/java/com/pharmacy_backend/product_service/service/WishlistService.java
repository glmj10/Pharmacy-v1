package com.pharmacy_backend.product_service.service;


import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.product_service.dto.response.PageResponse;
import com.pharmacy_backend.product_service.dto.response.ProductResponse;

import java.util.List;

public interface WishlistService {
    ApiResponse<PageResponse<List<ProductResponse>>> getMyWishlist(int pageIndex, int pageSize);
    ApiResponse<Void> addProductToWishlist(Long productId);
    ApiResponse<Void> removeProductsFromWishlist(List<Long> productIds);
    ApiResponse<Void> clearWishlist();
}
