package com.pharmacy_backend.cart_service.repository;


import com.pharmacy_backend.cart_service.entity.Cart;
import com.pharmacy_backend.cart_service.entity.User;

import java.util.Optional;

public interface CartRepository {
    boolean existsByUser(User user);
    Optional<Cart> findByUser(User user);
    Cart createCart(Cart cart);
}
