package com.pharmacy_backend.cart_service.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {
    @Getter
    private static String imagePrefix;

    @Value("${app.image.prefix}")
    public void setImagePrefix(String prefix) {
        AppConfig.imagePrefix = prefix;
    }
}
