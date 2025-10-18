package com.pharmacy_backend.user_service.service.impl;

import com.pharmacy_backend.common.enums.EventStatusEnum;
import com.pharmacy_backend.common.kafka.producer.EventProducer;
import com.pharmacy_backend.user_service.entity.OutboxEvent;
import com.pharmacy_backend.user_service.repository.OutboxEventRepository;
import com.pharmacy_backend.user_service.service.OutboxService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class OutboxServiceImpl implements OutboxService {
    private final OutboxEventRepository outboxRepository;
    private final EventProducer eventProducer;

    @Override
    public void publishPendingEvents() {
        List<OutboxEvent> pendingOutboxEvent = outboxRepository.
                findPendingEvents(EventStatusEnum.PENDING);

        for (OutboxEvent event : pendingOutboxEvent) {
            try {
                eventProducer.sendEvent(event.getTopic(),
                        event.getAggregateId(), event.getPayload());
                event.setEventStatus(EventStatusEnum.PROCESSED);
                event.setProcessedAt(LocalDateTime.now());
                outboxRepository.save(event);
            } catch (Exception e) {
                log.error("Failed to publish event with ID {}: {}", event.getId(), e.getMessage());
                event.setEventStatus(EventStatusEnum.FAILED);
                outboxRepository.save(event);
            }
        }
    }
}
