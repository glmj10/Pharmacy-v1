package com.pharmacy_backend.notification_service.kafka.consumer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmacy_backend.common.enums.EventTypeEnum;
import com.pharmacy_backend.common.enums.TopicEnum;
import com.pharmacy_backend.common.kafka.event.UserCreatedEvent;
import com.pharmacy_backend.common.kafka.event.UserVerifyAccountEvent;
import com.pharmacy_backend.common.kafka.event.base.Event;
import com.pharmacy_backend.notification_service.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserConsumer {
    private final ObjectMapper objectMapper;
    private final EmailService emailService;

    @KafkaListener(topics = "${spring.kafka.consumer.topic.user-topic}",
            groupId = "${spring.kafka.consumer.group-id}",
            concurrency = "${spring.kafka.consumer.concurrency}" )
    public void consumeUserCreatedEvent(String message, Acknowledgment acknowledgment) {
        try {
            Event<?> event = objectMapper.readValue(message, new TypeReference<>() {});
            if (event.getEventType().equalsIgnoreCase(EventTypeEnum.USER_VERIFIED.getName())) {
                UserVerifyAccountEvent userVerifyAccountEvent = objectMapper.convertValue(event.getData(),
                        UserVerifyAccountEvent.class);
                emailService.sendVerificationEmail(userVerifyAccountEvent.getEmail(),
                        userVerifyAccountEvent.getVerificationToken(),
                        userVerifyAccountEvent.getExpiryAt());
            }
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
        acknowledgment.acknowledge();
    }

    @KafkaListener(topics = "test-topic", groupId = "notification-service")
    public void consume(String message, Acknowledgment ack) throws JsonProcessingException {
        String response = objectMapper.readValue(message, String.class);
        System.out.println("Received message: " + response);
        ack.acknowledge();
    }
}
