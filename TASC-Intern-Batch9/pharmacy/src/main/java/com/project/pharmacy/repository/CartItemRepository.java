package com.project.pharmacy.repository;

import com.project.pharmacy.entity.Cart;
import com.project.pharmacy.entity.CartItem;
import com.project.pharmacy.entity.Product;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository {
    CartItem create(CartItem cartItem);

    List<CartItem> createAll(List<CartItem> cartItems);

    void updateCartItem(CartItem cartItem);

    void remove(CartItem cartItem);

    void removeAll(List<CartItem> cartItems);

    List<CartItem> findByCart(Cart cart);

    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);

    Optional<CartItem> findByCartAndId(Cart cart, Long id);

    List<CartItem> findAllByCartAndSelected(Cart cart, Boolean isSelected);

    List<CartItem> findAllByCart(Cart cart);
}
