package com.pharmacy_backend.cart_service.kafka.consumer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmacy_backend.cart_service.service.CartService;
import com.pharmacy_backend.cart_service.service.UserService;
import com.pharmacy_backend.common.enums.EventTypeEnum;
import com.pharmacy_backend.common.kafka.event.UserEvent;
import com.pharmacy_backend.common.kafka.event.base.Event;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserConsumer {
    private final ObjectMapper objectMapper;
    private final UserService userService;
    private final CartService cartService;

    @KafkaListener(topics = "${spring.kafka.consumer.topic.user-topic}",
            groupId = "${spring.kafka.consumer.group-id}",
            concurrency = "${spring.kafka.consumer.concurrency}" )
    public void consumeUserCreatedEvent(String message, Acknowledgment acknowledgment) {
        try {
            Event<?> event = objectMapper.readValue(message, new TypeReference<>() {});
            if(event.getEventType().equalsIgnoreCase(EventTypeEnum.USER_CREATED.getName())) {
                UserEvent userEvent = objectMapper.convertValue(event.getData(),
                        UserEvent.class);
                userService.createUserAndCreateCart(userEvent.getUserId(), userEvent.getEmail());
//                cartService.createCart(userEvent.getUserId());
                log.info("Consumed USER_CREATED event: {}", message);
            }
            acknowledgment.acknowledge();
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

}
