package com.pharmacy_backend.product_service.config;

import com.google.genai.Client;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {

    @Value("${genai.api.key}")
    private String genAiApiKey;

    @Bean
    public Client geminiClient() {
        return Client.builder()
                .apiKey(genAiApiKey)
                .build();
    }
}
