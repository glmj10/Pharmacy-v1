package com.project.pharmacy.service;

import com.project.pharmacy.dto.request.CartItemRequest;
import com.project.pharmacy.dto.response.ApiResponse;
import com.project.pharmacy.dto.response.CartItemResponse;
import com.project.pharmacy.dto.response.CartResponse;
import com.project.pharmacy.entity.User;

import java.util.List;

public interface CartService {
    void createCart(User user);
    ApiResponse<CartResponse> getCart();
    ApiResponse<CartItemResponse> addItemToCart(CartItemRequest request);
    ApiResponse<CartItemResponse> updateItemQuantity(Long itemId, Integer quantity);
    ApiResponse<Void> removeItemFromCart(Long itemId);
    ApiResponse<Void> clearCart();
    ApiResponse<CartItemResponse> changeItemSelection(Long itemId, Boolean status);
    ApiResponse<List<CartItemResponse>> selectAllItems(Boolean status);
    ApiResponse<List<CartResponse>> getCartItemsForCheckout();
    ApiResponse<Long> getTotalItemsInCart();
}
