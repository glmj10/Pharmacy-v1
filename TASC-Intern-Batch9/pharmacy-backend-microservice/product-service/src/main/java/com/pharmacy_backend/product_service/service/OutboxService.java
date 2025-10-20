package com.pharmacy_backend.product_service.service;

public interface OutboxService {

    void publishPendingEvents();
}
