package com.pharmacy_backend.blog_service.kafka.consumer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmacy_backend.blog_service.service.CategoryEventService;
import com.pharmacy_backend.common.enums.CategoryTypeEnum;
import com.pharmacy_backend.common.enums.EventTypeEnum;
import com.pharmacy_backend.common.kafka.event.CategoryEvent;
import com.pharmacy_backend.common.kafka.event.base.Event;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;


@Component
@RequiredArgsConstructor
@Slf4j
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
            CategoryEvent categoryEvent = objectMapper.convertValue(event.getData(), CategoryEvent.class);

            if(categoryEvent.getTypeCode().equalsIgnoreCase(CategoryTypeEnum.BLOG.name())) {
                if(eventType.equalsIgnoreCase(EventTypeEnum.CATEGORY_CREATED.getName())) {
                    categoryEventService.createCategory(categoryEvent);
                    log.info("Consumed CATEGORY_CREATED event: {}", message);
                }

                if(eventType.equalsIgnoreCase(EventTypeEnum.CATEGORY_UPDATED.getName())) {
                    categoryEventService.updateCategory(categoryEvent);
                    log.info("Consumed CATEGORY_UPDATED event: {}", message);
                }

                if(eventType.equalsIgnoreCase(EventTypeEnum.CATEGORY_DELETED.getName())) {
                    categoryEventService.deleteCategory(categoryEvent);
                    log.info("Consumed CATEGORY_DELETED event: {}", message);
                }
            }

            acknowledgment.acknowledge();
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}
