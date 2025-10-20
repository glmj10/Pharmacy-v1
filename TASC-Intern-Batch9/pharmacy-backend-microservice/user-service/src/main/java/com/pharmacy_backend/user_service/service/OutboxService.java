package com.pharmacy_backend.user_service.service;

public interface OutboxService {

    void publishPendingEvents();
}
