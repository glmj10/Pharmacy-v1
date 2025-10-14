package com.pharmacy_backend.identity_service.kafka.producer;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmacy_backend.common.kafka.producer.EventProducer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserProducer {
    private final EventProducer eventProducer;
    private final ObjectMapper objectMapper;

    public void sendMessage(String message) {
        try {
            String json = objectMapper.writeValueAsString(message);
            eventProducer.sendEvent("test-topic", json);
        } catch (Exception e) {
            log.error("Failed to send message to topic {}: {}", "test-topic", e.getMessage());
        }
    }
}
