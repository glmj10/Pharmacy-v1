package com.pharmacy_backend.identity_service.service.impl;

import com.pharmacy_backend.common.service.RedisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class RedisServiceImpl implements RedisService {
    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    public void setValue(String key, String value) {
        redisTemplate.opsForValue().set(key, value);
        log.info("Set key: {} with value: {}", key, value);
    }

    @Override
    public void setValue(String key, String value, long expirationSeconds) {
        redisTemplate.opsForValue().set(key, value, Duration.ofSeconds(expirationSeconds));
        log.info("Set key: {} with value: {} and expiration: {} seconds", key, value, expirationSeconds);
    }

    @Override
    public Object getValue(String key) {
        Object value = redisTemplate.opsForValue().get(key);
        log.info("Get key: {} returned value: {}", key, value);
        return value;
    }

    @Override
    public void deleteValue(String key) {
        redisTemplate.delete(key);
        log.info("Deleted key: {}", key);
    }
}
