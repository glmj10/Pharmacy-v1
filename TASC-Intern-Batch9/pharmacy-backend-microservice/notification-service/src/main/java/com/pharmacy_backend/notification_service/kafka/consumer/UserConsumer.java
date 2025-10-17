package com.pharmacy_backend.notification_service.kafka.consumer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmacy_backend.common.enums.EventTypeEnum;
import com.pharmacy_backend.common.enums.TopicEnum;
import com.pharmacy_backend.common.kafka.event.UserCreatedEvent;
import com.pharmacy_backend.common.kafka.event.UserForgotPasswordEvent;
import com.pharmacy_backend.common.kafka.event.UserVerifyAccountEvent;
import com.pharmacy_backend.common.kafka.event.base.Event;
import com.pharmacy_backend.notification_service.service.EmailService;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

import java.io.UnsupportedEncodingException;

@Component
@RequiredArgsConstructor
public class UserConsumer {
    private final ObjectMapper objectMapper;
    private final EmailService emailService;

    @KafkaListener(topics = "${spring.kafka.consumer.topic.user-topic}",
            groupId = "${spring.kafka.consumer.group-id}",
            concurrency = "${spring.kafka.consumer.concurrency}" )
    public void consumeUserEvent(String message, Acknowledgment acknowledgment) {
        try {
            Event<?> event = objectMapper.readValue(message, new TypeReference<>() {});
            if (event.getEventType().equalsIgnoreCase(EventTypeEnum.USER_VERIFIED.getName())) {
                UserVerifyAccountEvent userVerifyAccountEvent = objectMapper.convertValue(event.getData(),
                        UserVerifyAccountEvent.class);
                emailService.sendVerificationEmail(userVerifyAccountEvent.getEmail(),
                        userVerifyAccountEvent.getVerificationToken(),
                        userVerifyAccountEvent.getExpiryAt());
            }

            if(event.getEventType().equalsIgnoreCase(EventTypeEnum.PASSWORD_RESET.getName())) {
                UserForgotPasswordEvent userForgotPasswordEvent = objectMapper.convertValue(event.getData(),
                        UserForgotPasswordEvent.class);
                emailService.sendResetEmail(userForgotPasswordEvent.getEmail(),
                        userForgotPasswordEvent.getResetPasswordToken(), userForgotPasswordEvent.getExpiryAt(),
                        userForgotPasswordEvent.isUser());
            }

            acknowledgment.acknowledge();
        } catch (JsonProcessingException | MessagingException | UnsupportedEncodingException e) {
            throw new RuntimeException(e);
        }
    }

    @KafkaListener(topics = "test-topic", groupId = "notification-service")
    public void consume(String message, Acknowledgment ack) throws JsonProcessingException {
        String response = objectMapper.readValue(message, String.class);
        System.out.println("Received message: " + response);
        ack.acknowledge();
    }

}
