package com.pharmacy_backend.product_service.service.impl;

import com.pharmacy_backend.common.kafka.event.UserEvent;
import com.pharmacy_backend.product_service.entity.User;
import com.pharmacy_backend.product_service.repository.UserRepository;
import com.pharmacy_backend.product_service.service.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;

    @Override
    public void createUser(UserEvent userEvent) {
        User user = new User(userEvent);
        userRepository.save(user);
    }

    @Override
    public void updateUser(UserEvent userEvent) {
        User user = userRepository.findById(userEvent.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userEvent.getUserId()));
        user.setUsername(userEvent.getUsername());
        user.setEmail(userEvent.getEmail());
        user.setProfilePicUrl(userEvent.getProfilePicUrl());
        userRepository.save(user);
    }
}
