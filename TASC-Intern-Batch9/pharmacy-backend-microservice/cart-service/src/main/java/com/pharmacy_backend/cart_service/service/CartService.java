package com.pharmacy_backend.cart_service.service;

import com.pharmacy_backend.cart_service.dto.request.CartItemRequest;
import com.pharmacy_backend.cart_service.dto.response.CartItemResponse;
import com.pharmacy_backend.cart_service.dto.response.CartResponse;
import com.pharmacy_backend.cart_service.entity.Cart;
import com.pharmacy_backend.common.dto.response.ApiResponse;

import java.util.List;

public interface CartService {
    ApiResponse<CartResponse> getCart();
    ApiResponse<CartItemResponse> addItemToCart(CartItemRequest request);
    ApiResponse<CartItemResponse> updateItemQuantity(Long itemId, Integer quantity);
    ApiResponse<Void> removeItemFromCart(Long itemId);
    ApiResponse<Void> clearCart();
    ApiResponse<CartItemResponse> changeItemSelection(Long itemId, Boolean status);
    ApiResponse<List<CartItemResponse>> selectAllItems(Boolean status);
    ApiResponse<List<CartResponse>> getCartItemsForCheckout();
    ApiResponse<Long> getTotalItemsInCart();
    Cart createCart(Long userId);
}
