package com.pharmacy_backend.category_service.service;

public interface OutboxService {

    void publishPendingEvents();
}
