package com.pharmacy.payment_service.service.impl;

import com.pharmacy_backend.order_service.entity.User;
import com.pharmacy_backend.order_service.repository.UserRepository;
import com.pharmacy_backend.order_service.service.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;

    @Override
    public void createUser(Long userId, String email) {
        User user = new User(userId, email);
        userRepository.save(user);
    }
}
