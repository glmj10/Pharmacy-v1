package com.pharmacy_backend.common.service;

import com.pharmacy_backend.common.kafka.event.base.Event;

public interface OutboxService {
    void publishPendingEvents();
    void handleSaveOutboxEvent(Event<?> event);
}
