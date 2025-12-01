package com.pharmacy_backend.product_service.service;

import java.time.LocalDateTime;

public interface CronjobCacheService {
    void cacheLastRunTime();
    LocalDateTime getLastRunTime();
}
