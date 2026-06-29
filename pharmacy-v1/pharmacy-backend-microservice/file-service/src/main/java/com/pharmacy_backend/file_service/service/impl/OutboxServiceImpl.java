package com.pharmacy_backend.file_service.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmacy_backend.common.enums.ErrorCode;
import com.pharmacy_backend.common.enums.EventStatusEnum;
import com.pharmacy_backend.common.enums.PartitionKeyEnum;
import com.pharmacy_backend.common.enums.TopicEnum;
import com.pharmacy_backend.common.exceptions.CustomException;
import com.pharmacy_backend.common.kafka.event.base.Event;
import com.pharmacy_backend.common.kafka.producer.EventProducer;
import com.pharmacy_backend.file_service.entity.OutboxEvent;
import com.pharmacy_backend.file_service.repository.OutboxEventRepository;
import com.pharmacy_backend.file_service.service.OutboxService;
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
    private final ObjectMapper objectMapper;

    @Override
    public void publishPendingEvents() {
        List<OutboxEvent> pendingOutboxEvent = outboxRepository.
                findPendingAndFailedEvents(EventStatusEnum.PENDING, EventStatusEnum.FAILED);

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

    @Override
    public void handleSaveEvent(Event<?> event) {
        OutboxEvent outboxEvent = new OutboxEvent();
        outboxEvent.setAggregateType(PartitionKeyEnum.FILE.getName());
        outboxEvent.setAggregateId(event.getKey());
        outboxEvent.setEventType(event.getEventType());
        outboxEvent.setTopic(TopicEnum.FILE_TOPIC.getName());
        try {
            outboxEvent.setPayload(objectMapper.writeValueAsString(event));
            outboxRepository.save(outboxEvent);
        } catch (JsonProcessingException e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR,
                    e.getMessage());
        }
    }

    @Override
    public void handleSaveEvent(Event<?> event, TopicEnum topic) {
        OutboxEvent outboxEvent = new OutboxEvent();
        outboxEvent.setAggregateType(PartitionKeyEnum.FILE.getName());
        outboxEvent.setAggregateId(event.getKey());
        outboxEvent.setEventType(event.getEventType());
        outboxEvent.setTopic(topic.getName());
        try {
            outboxEvent.setPayload(objectMapper.writeValueAsString(event));
            outboxRepository.save(outboxEvent);
        } catch (JsonProcessingException e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR,
                    e.getMessage());
        }
    }
}
