package com.pharmacy_backend.order_service.service;

public interface OutboxService {

    void publishPendingEvents();
}
