package com.project.pharmacy.controller;

import com.project.pharmacy.dto.response.ApiResponse;
import com.project.pharmacy.dto.response.ProductResponse;
import com.project.pharmacy.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequiredArgsConstructor
@RequestMapping("/api/v1/wishlist")
@PreAuthorize( "hasRole('USER')")
public class WishlistController {
    private final WishlistService wishlistService;


    @GetMapping("/my-wishlist")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getMyWishlist() {
        ApiResponse<List<ProductResponse>> response = wishlistService.getMyWishlist();
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> addProductToWishlist(@RequestParam Long productId) {
        ApiResponse<Void> response = wishlistService.addProductToWishlist(productId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }


    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<ApiResponse<Void>> removeProductFromWishlist(@PathVariable Long productId) {
        ApiResponse<Void> response = wishlistService.removeProductFromWishlist(productId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse<Void>> clearWishlist() {
        ApiResponse<Void> response = wishlistService.clearWishlist();
        return ResponseEntity.status(response.getStatus()).body(response);
    }

}
