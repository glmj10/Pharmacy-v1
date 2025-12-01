package com.pharmacy_backend.product_service.service.impl;

import com.pharmacy_backend.product_service.entity.Product;
import com.pharmacy_backend.product_service.repository.ProductRepository;
import com.pharmacy_backend.product_service.service.CacheWarmupService;
import com.pharmacy_backend.product_service.service.StockCacheService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
@Slf4j
public class CacheWarmupServiceImpl
//        implements CacheWarmupService
{
    private final ProductRedisService productRedisService;
    private final StockCacheService stockCacheService;
    private final ProductRepository productRepository;
    @Qualifier("myThreadPoolExecutor")
    private final ThreadPoolTaskExecutor threadPoolTaskExecutor;

    @Value("${cache.warm-up.enable:false}")
    private String cacheWarmupEnable;

    @Value("${cache.warm-up.batch-size}")
    private int batchSize;

    public CacheWarmupServiceImpl(ProductRedisService productRedisService, StockCacheService stockCacheService,
                                  ProductRepository productRepository,
                                  @Qualifier("myThreadPoolTaskExecutor") ThreadPoolTaskExecutor threadPoolTaskExecutor) {
        this.productRedisService = productRedisService;
        this.stockCacheService = stockCacheService;
        this.productRepository = productRepository;
        this.threadPoolTaskExecutor = threadPoolTaskExecutor;
    }

//    @EventListener(ApplicationReadyEvent.class)
//    public void warmUpCacheOnStartup() {
//        CompletableFuture.runAsync(this::preloadProducts, threadPoolTaskExecutor);
//    }
//
//    @Override
//    public void preloadProducts() {
//        if(Boolean.parseBoolean(cacheWarmupEnable)) {
//            Long minId = productRepository.findMinId();
//            Long maxId = productRepository.findMaxId();
//
//            if (minId == null || maxId == null) {
//                log.warn("No products found in the database to warm up the cache.");
//                return;
//            }
//
//            List<CompletableFuture<Void>> futures = new ArrayList<>();
//
//            for(long startId = minId; startId <= maxId; startId += batchSize) {
//                long endId = Math.min(startId + batchSize, maxId + 1);
//
//                long finalStartId = startId;
//                CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
//                    try {
//                        List<Product> batch = productRepository.findAllFromRange(finalStartId, endId);
//                        batch.forEach(product ->{
//                            productRedisService.cacheProductDetail(product);
//                            stockCacheService.setStock(product.getId(), product.getQuantity());
//                        });
//                        log.info("📦 Cache batch {} → {} ({} items)", finalStartId, endId, batch.size());
//                    } catch (Exception e) {
//                        log.error("❌ Lỗi khi nạp batch {} → {}", finalStartId, endId, e);
//                    }
//                }, threadPoolTaskExecutor);
//
//                futures.add(future);
//            }
//
//            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
//            log.info("✅ Hoàn thành nạp cache sản phẩm từ ID {} đến ID {}", minId, maxId);
//
//        } else {
//            log.info("Disabling cache warm-up as per configuration.");
//        }
//    }

}
