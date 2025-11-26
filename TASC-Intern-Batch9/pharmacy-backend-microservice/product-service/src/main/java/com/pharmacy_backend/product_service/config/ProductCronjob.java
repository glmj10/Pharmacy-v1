package com.pharmacy_backend.product_service.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmacy_backend.product_service.entity.Product;
import com.pharmacy_backend.product_service.repository.ProductRepository;
import com.pharmacy_backend.product_service.service.StockCacheService;
import com.pharmacy_backend.product_service.service.impl.ProductRedisService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE)
@RequiredArgsConstructor
public class ProductCronjob {
    final ProductRepository productRepository;
    final ProductRedisService productRedisService;
    final StockCacheService stockCacheService;

    @Value("${cache.product.modified-time.ttl}")
    int productModifiedTimeTTL;

    @Scheduled(cron = "0/15 * * * * *")
    public void cacheModifiedProducts() {
        log.info("Running cron job to set all products to available");
        List<Product> products = productRepository.findAllByUpdatedAtBefore(productModifiedTimeTTL);
        products.forEach(product ->{
            productRedisService.cacheProductDetail(product);
            stockCacheService.setStock(product.getId(), product.getQuantity());
        });
        log.info("Finished caching {} products", products.size());
    }

}
