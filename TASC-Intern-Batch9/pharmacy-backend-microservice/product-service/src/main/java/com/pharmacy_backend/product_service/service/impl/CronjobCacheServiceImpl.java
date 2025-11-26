package com.pharmacy_backend.product_service.service.impl;

import com.pharmacy_backend.common.enums.RedisKeyTypeEnum;
import com.pharmacy_backend.product_service.service.CronjobCacheService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CronjobCacheServiceImpl implements CronjobCacheService {
    private final String LAST_RUN_TIME_KEY = RedisKeyTypeEnum.LAST_RUN_TIME.name();
    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    public void cacheLastRunTime() {

    }

    @Override
    public LocalDateTime getLastRunTime() {
        return null;
    }
}
