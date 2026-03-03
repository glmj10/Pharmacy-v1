package com.pharmacy_backend.product_service.controller;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.product_service.dto.response.PageResponse;
import com.pharmacy_backend.product_service.dto.response.ProductResponse;
import com.pharmacy_backend.product_service.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/wishlists")
@PreAuthorize( "hasRole('USER')")
public class WishlistController {
    private final WishlistService wishlistService;

    @GetMapping("/my-wishlist")
    public ResponseEntity<ApiResponse<PageResponse<List<ProductResponse>>>> getMyWishlist(@RequestParam(defaultValue = "1") int pageIndex,
                                                                                             @RequestParam(defaultValue = "10") int pageSize) {
        ApiResponse<PageResponse<List<ProductResponse>>> response = wishlistService.getMyWishlist(pageIndex, pageSize);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> addProductToWishlist(@RequestParam Long productId) {
        ApiResponse<Void> response = wishlistService.addProductToWishlist(productId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @DeleteMapping("/remove")
    public ResponseEntity<ApiResponse<Void>> removeProductFromWishlist(@RequestParam List<Long> productIds) {
        ApiResponse<Void> response = wishlistService.removeProductsFromWishlist(productIds);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse<Void>> clearWishlist() {
        ApiResponse<Void> response = wishlistService.clearWishlist();
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}
