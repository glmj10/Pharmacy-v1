package com.pharmacy_backend.product_service.service;


import com.pharmacy_backend.common.kafka.event.UserEvent;

public interface UserService {
    void createUser(UserEvent userEvent);
    void updateUser(UserEvent userEvent);
}
