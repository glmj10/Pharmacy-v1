package com.pharmacy_backend.cart_service.kafka.consumer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserConsumer {
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "test-topic", groupId = "cart-service")
    public void consume(String message, Acknowledgment ack) throws JsonProcessingException {
        String response = objectMapper.readValue(message, String.class);
        System.out.println("Received message: " + response);
        ack.acknowledge();
    }

}
