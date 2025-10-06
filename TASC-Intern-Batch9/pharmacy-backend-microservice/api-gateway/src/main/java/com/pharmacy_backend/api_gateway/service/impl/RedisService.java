package com.pharmacy_backend.api_gateway.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RedisService {
    private final RedisTemplate<String, Object> redisTemplate;

    public Object getValue(String key) {
        return redisTemplate.opsForValue().get(key);
    }
}
