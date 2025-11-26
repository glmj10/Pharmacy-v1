package com.pharmacy_backend.order_service.service;


public interface UserService {
    void createUser(Long userId, String email, String profilePicUrl);
}
