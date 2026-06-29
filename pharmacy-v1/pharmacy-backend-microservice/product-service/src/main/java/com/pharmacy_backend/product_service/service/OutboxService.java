package com.pharmacy_backend.product_service.service;

import com.pharmacy_backend.common.enums.PartitionKeyEnum;
import com.pharmacy_backend.common.enums.TopicEnum;
import com.pharmacy_backend.common.kafka.event.base.Event;

public interface OutboxService {

    void publishPendingEvents();
    void handleSaveEvent(Event<?> event);
    void handleSaveEvent(Event<?> event, TopicEnum topic, PartitionKeyEnum aggregateType);
}
