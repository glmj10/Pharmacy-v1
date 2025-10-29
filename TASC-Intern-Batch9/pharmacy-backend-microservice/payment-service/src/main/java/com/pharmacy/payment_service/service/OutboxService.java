package com.pharmacy.payment_service.service;

public interface OutboxService {

    void publishPendingEvents();
}
