package com.pharmacy_backend.blog_service.kafka.consumer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmacy_backend.blog_service.service.CategoryEventService;
import com.pharmacy_backend.common.enums.EventTypeEnum;
import com.pharmacy_backend.common.kafka.event.CategoryEvent;
import com.pharmacy_backend.common.kafka.event.base.Event;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;


@Component
@RequiredArgsConstructor
public class CategoryConsumer {

    private final ObjectMapper objectMapper;
    private final CategoryEventService categoryEventService;

    @KafkaListener(topics = "${spring.kafka.consumer.topic.category-topic}",
            groupId = "${spring.kafka.consumer.group-id}",
            concurrency = "${spring.kafka.consumer.concurrency}" )
    public void consumeUserCreatedEvent(String message, Acknowledgment acknowledgment) {
        try {
            Event<?> event = objectMapper.readValue(message, new TypeReference<>() {});
            String eventType = event.getEventType();

            if(eventType.equalsIgnoreCase(EventTypeEnum.CATEGORY_CREATED.getName())) {
                CategoryEvent categoryEvent = objectMapper.convertValue(event.getData(), CategoryEvent.class);
                categoryEventService.createCategory(categoryEvent);
            }

            if(eventType.equalsIgnoreCase(EventTypeEnum.CATEGORY_UPDATED.getName())) {
                CategoryEvent categoryEvent = objectMapper.convertValue(event.getData(), CategoryEvent.class);
                categoryEventService.updateCategory(categoryEvent);
            }

            if(eventType.equalsIgnoreCase(EventTypeEnum.CATEGORY_DELETED.getName())) {
                CategoryEvent categoryEvent = objectMapper.convertValue(event.getData(), CategoryEvent.class);
                categoryEventService.deleteCategory(categoryEvent);
            }

            acknowledgment.acknowledge();
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}
