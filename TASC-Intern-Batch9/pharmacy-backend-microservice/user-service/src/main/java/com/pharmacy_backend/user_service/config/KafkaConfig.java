package com.pharmacy_backend.user_service.config;

import com.pharmacy_backend.common.config.KafkaCommonConfig;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.ConsumerFactory;

@Configuration
public class KafkaConfig extends KafkaCommonConfig {
    public KafkaConfig(ConsumerFactory<String, String> consumerFactory) {
        super(consumerFactory);
    }
}
