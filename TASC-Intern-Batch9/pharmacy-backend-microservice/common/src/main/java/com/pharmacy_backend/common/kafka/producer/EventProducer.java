package com.pharmacy_backend.common.kafka.producer;

import com.pharmacy_backend.common.enums.ErrorCode;
import com.pharmacy_backend.common.exceptions.CustomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class EventProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;

    public void sendEvent(String topic, String payload) {
        try {
            kafkaTemplate.send(topic, payload);
        } catch (Exception e) {
            log.error("Failed to send event to topic {}: {}", topic, e.getMessage());
            throw e;
        }
    }
}
