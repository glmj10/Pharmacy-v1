package com.pharmacy_backend.identity_service.service;

public interface OutboxService {

    void publishPendingEvents();
}
