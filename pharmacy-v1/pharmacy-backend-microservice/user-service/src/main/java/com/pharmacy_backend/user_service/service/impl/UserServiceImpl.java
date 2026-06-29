package com.pharmacy_backend.user_service.service.impl;

import com.pharmacy_backend.user_service.entity.User;
import com.pharmacy_backend.user_service.repository.UserRepository;
import com.pharmacy_backend.user_service.service.UserService;
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
        User user = new User();
        user.setId(userId);
        user.setEmail(email);
        userRepository.save(user);
    }
}
