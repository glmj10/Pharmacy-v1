package com.pharmacy_backend.notification_service.kafka.consumer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmacy_backend.common.enums.EventTypeEnum;
import com.pharmacy_backend.common.kafka.event.OrderEvent;
import com.pharmacy_backend.common.kafka.event.base.Event;
import com.pharmacy_backend.notification_service.service.EmailService;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

import java.io.UnsupportedEncodingException;

@Component
@Slf4j
@RequiredArgsConstructor
public class OrderConsumer {
    private final EmailService emailService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "${spring.kafka.consumer.topic.order-topic}",
            groupId = "${spring.kafka.consumer.group-id}",
            concurrency = "${spring.kafka.consumer.concurrency}" )
    public void consumeOrderEvent(String message, Acknowledgment acknowledgment) {
        try {
            Event<?> event = objectMapper.readValue(message, new TypeReference<>() {});
            if(event.getEventType().equalsIgnoreCase(EventTypeEnum.ORDER_CREATED.getName())) {
                OrderEvent orderEvent = objectMapper.convertValue(event.getData(),
                        OrderEvent.class);
                emailService.sendOrderConfirmationEmail(orderEvent);
                log.info("Consume order created event: {}", event);
            }

            acknowledgment.acknowledge();
        } catch (JsonProcessingException | MessagingException | UnsupportedEncodingException e) {
            throw new RuntimeException(e);
        }
    }

}
