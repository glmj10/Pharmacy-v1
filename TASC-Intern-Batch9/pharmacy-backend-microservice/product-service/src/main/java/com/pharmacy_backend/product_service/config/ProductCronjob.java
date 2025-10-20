package com.pharmacy_backend.product_service.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmacy_backend.product_service.entity.Product;
import com.pharmacy_backend.product_service.repository.ProductRepository;
import com.pharmacy_backend.product_service.service.impl.ProductRedisService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE)
@RequiredArgsConstructor
public class ProductCronjob {
    final ProductRepository productRepository;
    final ObjectMapper objectMapper;
    final ProductRedisService productRedisService;

    @Scheduled(cron = "0 * * * * *")
    public void setAllProductsAvailable() {
        log.info("Running cron job to set all products to available");
        List<Product> products = productRepository.findAll(true);
        products.forEach(productRedisService::cacheProductDetail);
        log.info("Finished caching {} products", products.size());
    }
}
