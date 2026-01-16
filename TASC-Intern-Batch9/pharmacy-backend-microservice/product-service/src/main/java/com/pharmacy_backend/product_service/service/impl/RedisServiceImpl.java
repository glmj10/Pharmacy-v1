package com.pharmacy_backend.product_service.service.impl;

import com.pharmacy_backend.common.service.RedisService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class RedisServiceImpl implements RedisService {
    private final RedisTemplate<String, String> redisTemplate;

    @Override
    public void deleteCacheKey(String key) {
        redisTemplate.delete(key);
    }

    @Override
    public void setCache(String key, String value, long duration) {
        redisTemplate.opsForValue().set(key, String.valueOf(value));
        redisTemplate.expire(key, Duration.ofSeconds(duration));
    }

    @Override
    public void addValueToSet(String key, String[] value, long duration) {
        redisTemplate.opsForSet().add(key, value);
        redisTemplate.expire(key, Duration.ofSeconds(duration));
    }

    @Override
    public void addValueToSet(String key, String value, long duration) {
        redisTemplate.opsForSet().add(key, value);
        redisTemplate.expire(key, Duration.ofSeconds(duration));
    }

    @Override
    public String getCache(String key) {
        return redisTemplate.opsForValue().get(key);
    }

    @Override
    public Set<String> getSetMembers(String key) {
        return redisTemplate.opsForSet().members(key);
    }

    @Override
    public void removeSetMember(String key, String... value) {
        redisTemplate.opsForSet().remove(key, (Object[]) value);
    }

    @Override
    public void removeAllSetMembers(String key) {
        redisTemplate.delete(key);
    }
}
