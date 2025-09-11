package com.project.pharmacy.service.impl;

import com.project.pharmacy.entity.Cart;
import com.project.pharmacy.entity.User;
import com.project.pharmacy.enums.ErrorCode;
import com.project.pharmacy.exceptions.CustomException;
import com.project.pharmacy.repository.CartRepository;
import com.project.pharmacy.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class CartServiceImpl implements CartService {
    private final CartRepository cartRepository;

    @Autowired
    public CartServiceImpl(CartRepository cartRepository) {
        this.cartRepository = cartRepository;
    }

    @Override
    public void createCart(User user) {
        try {
            Cart cart = new Cart();
            cart.setUser(user);
            cartRepository.save(cart);
        } catch (Exception e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }
}
