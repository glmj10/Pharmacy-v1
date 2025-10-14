package com.pharmacy_backend.identity_service.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KafkaConfig {
    @Value("${spring.kafka.producer.topic.user-created}")
    public static String USER_REGISTERED_TOPIC;

    @Value("${spring.kafka.producer.topic.user-updated}")
    public static String USER_UPDATED_TOPIC;
}
