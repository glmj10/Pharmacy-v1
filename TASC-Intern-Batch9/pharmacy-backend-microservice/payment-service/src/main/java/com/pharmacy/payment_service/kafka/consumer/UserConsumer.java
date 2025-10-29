package com.pharmacy.payment_service.kafka.consumer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmacy_backend.common.enums.EventTypeEnum;
import com.pharmacy_backend.common.kafka.event.UserCreatedEvent;
import com.pharmacy_backend.common.kafka.event.base.Event;
import com.pharmacy_backend.order_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserConsumer {
    private final ObjectMapper objectMapper;
    private final UserService userService;

    @KafkaListener(topics = "${spring.kafka.consumer.topic.user-topic}",
            groupId = "${spring.kafka.consumer.group-id}",
            concurrency = "${spring.kafka.consumer.concurrency}" )
    public void consumeUserCreatedEvent(String message, Acknowledgment acknowledgment) {
        try {
            Event<?> event = objectMapper.readValue(message, new TypeReference<>() {});
            if(event.getEventType().equalsIgnoreCase(EventTypeEnum.USER_CREATED.getName())) {
                UserCreatedEvent userCreatedEvent = objectMapper.convertValue(event.getData(),
                        UserCreatedEvent.class);
                userService.createUser(userCreatedEvent.getUserId(), userCreatedEvent.getEmail());
                System.out.println("Received user event: " + event);
            }
            acknowledgment.acknowledge();
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

}
