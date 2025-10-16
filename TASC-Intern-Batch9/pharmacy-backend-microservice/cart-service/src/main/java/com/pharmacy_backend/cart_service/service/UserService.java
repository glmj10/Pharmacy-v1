package com.pharmacy_backend.cart_service.service;


import com.pharmacy_backend.cart_service.entity.Cart;
import com.pharmacy_backend.cart_service.entity.User;
import com.pharmacy_backend.cart_service.repository.CartRepository;
import com.pharmacy_backend.cart_service.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
@Transactional
public class UserService {
    private final UserRepository userRepository;
    private final CartService cartService;

    public void createUserAndCreateCart(Long userId, String email) {
        User user = new User(userId, email);
        userRepository.save(user);

        userRepository.flush();
        Cart cart = cartService.createCart(user.getId());
        user.setCart(cart);
        userRepository.save(user);
    }
}
