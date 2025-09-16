package com.project.pharmacy.repository;

import com.project.pharmacy.entity.Cart;
import com.project.pharmacy.entity.User;

import java.util.Optional;

public interface CartRepository {
    boolean existsByUser(User user);
    Optional<Cart> findByUser(User user);
    Cart createCart(Cart cart);
    Cart updateCart(Cart cart);
}
