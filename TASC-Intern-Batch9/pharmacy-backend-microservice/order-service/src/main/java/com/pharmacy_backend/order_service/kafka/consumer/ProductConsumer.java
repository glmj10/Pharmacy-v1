package com.pharmacy_backend.order_service.kafka.consumer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmacy_backend.common.enums.EventTypeEnum;
import com.pharmacy_backend.common.kafka.event.ProductEvent;
import com.pharmacy_backend.common.kafka.event.base.Event;
import com.pharmacy_backend.order_service.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProductConsumer {

    private final ObjectMapper objectMapper;
    private final ProductService productService;

    @KafkaListener(topics = "${spring.kafka.consumer.topic.product-topic}",
            groupId = "${spring.kafka.consumer.group-id}",
            concurrency = "${spring.kafka.consumer.concurrency}")
    public void consumeProductCreatedEvent(String message, Acknowledgment acknowledgment) {
        try {
            Event<?> event = objectMapper.readValue(message, new TypeReference<>() {
            });
            String eventType = event.getEventType();
            ProductEvent productEvent;

            if (eventType.equalsIgnoreCase(EventTypeEnum.PRODUCT_CREATED.getName())) {
                productEvent = objectMapper.convertValue(event.getData(), ProductEvent.class);
                productService.createProduct(productEvent);
                log.info("Consumed PRODUCT_CREATED event: {}", message);
            }

            if (eventType.equalsIgnoreCase(EventTypeEnum.PRODUCT_UPDATED.getName())) {
                productEvent = objectMapper.convertValue(event.getData(), ProductEvent.class);
                productService.updateProduct(productEvent);
                log.info("Consumed PRODUCT_UPDATED event: {}", message);
            }

            if (eventType.equalsIgnoreCase(EventTypeEnum.PRODUCT_DELETED.getName())) {
                productEvent = objectMapper.convertValue(event.getData(), ProductEvent.class);
                productService.changeProductStatus(productEvent.getProductId(), false);
                log.info("Consumed PRODUCT_DELETED event: {}", message);
            }

            if(eventType.equalsIgnoreCase(EventTypeEnum.PRODUCT_UPDATED_ALL.getName())) {
                productService.updateAll(objectMapper.convertValue(event.getData(), new TypeReference<>() {
                }));
                log.info("Consumed PRODUCT_UPDATED_ALL event: {}", message);
            }

            acknowledgment.acknowledge();
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}
