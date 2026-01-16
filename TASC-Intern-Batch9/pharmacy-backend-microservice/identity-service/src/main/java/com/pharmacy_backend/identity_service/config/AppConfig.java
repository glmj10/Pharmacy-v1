package com.pharmacy_backend.identity_service.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Random;

@Configuration
public class AppConfig {

    @Getter
    private static String imagePrefix;

    @Value("${app.image.prefix}")
    public void setImagePrefix(String prefix) {
        AppConfig.imagePrefix = prefix;
    }

    @Bean
    public Random random() {
        return new Random();
    }
}
