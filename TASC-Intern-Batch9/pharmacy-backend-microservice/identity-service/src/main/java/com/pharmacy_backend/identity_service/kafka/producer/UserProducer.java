package com.pharmacy_backend.identity_service.kafka.producer;


import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserProducer {
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void sendMessage(String message) {
        try {
            String json = objectMapper.writeValueAsString(message);
            kafkaTemplate.send("test-topic", json);
        } catch (Exception e) {
            log.error("Failed to send message to topic {}: {}", "test-topic", e.getMessage());
        }
    }
}
