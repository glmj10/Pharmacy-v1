package com.pharmacy_backend.cart_service.service.impl;

import com.pharmacy_backend.cart_service.dto.request.CartItemRequest;
import com.pharmacy_backend.cart_service.dto.response.CartItemResponse;
import com.pharmacy_backend.cart_service.dto.response.CartResponse;
import com.pharmacy_backend.cart_service.entity.Cart;
import com.pharmacy_backend.cart_service.entity.User;
import com.pharmacy_backend.cart_service.repository.CartRepository;
import com.pharmacy_backend.cart_service.repository.UserRepository;
import com.pharmacy_backend.cart_service.service.CartService;
import com.pharmacy_backend.common.dto.response.ApiResponse;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
@FieldDefaults(level = AccessLevel.PRIVATE)
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {
    final UserRepository userRepository;
    final CartRepository cartRepository;
    @Override
    public ApiResponse<CartResponse> getCart() {
        return null;
    }

    @Override
    public ApiResponse<CartItemResponse> addItemToCart(CartItemRequest request) {
        return null;
    }

    @Override
    public ApiResponse<CartItemResponse> updateItemQuantity(Long itemId, Integer quantity) {
        return null;
    }

    @Override
    public ApiResponse<Void> removeItemFromCart(Long itemId) {
        return null;
    }

    @Override
    public ApiResponse<Void> clearCart() {
        return null;
    }

    @Override
    public ApiResponse<CartItemResponse> changeItemSelection(Long itemId, Boolean status) {
        return null;
    }

    @Override
    public ApiResponse<List<CartItemResponse>> selectAllItems(Boolean status) {
        return null;
    }

    @Override
    public ApiResponse<List<CartResponse>> getCartItemsForCheckout() {
        return null;
    }

    @Override
    public ApiResponse<Long> getTotalItemsInCart() {
        return null;
    }

    @Override
    public Cart createCart(Long userId) {
        User user  = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        Cart cart = new Cart();
        cart.setUser(user);
        return cartRepository.createCart(cart);
    }
}
