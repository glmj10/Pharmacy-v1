package com.pharmacy_backend.product_service.config;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;


@Configuration
public class AsyncConfig {

    @Value("${async.core-pool-size}")
    private int corePoolSize;

    @Value("${async.max-pool-size}")
    private int maxPoolSize;

    @Value("${async.queue-capacity}")
    private int queueCapacity;

    @Bean(name = "myThreadPoolTaskExecutor")
    public ThreadPoolTaskExecutor threadPoolExecutor() {
        ThreadPoolTaskExecutor threadPoolExecutor = new ThreadPoolTaskExecutor();
        threadPoolExecutor.setMaxPoolSize(maxPoolSize);
        threadPoolExecutor.setCorePoolSize(corePoolSize);
        threadPoolExecutor.setQueueCapacity(queueCapacity);
        threadPoolExecutor.setWaitForTasksToCompleteOnShutdown(true);
        threadPoolExecutor.setThreadNamePrefix("cache-warmup-");
        threadPoolExecutor.initialize();
        return threadPoolExecutor;
    }
}
