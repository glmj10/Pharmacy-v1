package com.pharmacy_backend.common.repository.impl;

import com.pharmacy_backend.common.repository.RedisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class RedisRepositoryImpl implements RedisRepository {
    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    public void save(String key, Object value, long timeout) {
        redisTemplate.opsForValue().set(key, value, java.time.Duration.ofSeconds(timeout));
    }

    @Override
    public void save(String key, Object value) {
        redisTemplate.opsForValue().set(key, value);
    }

    @Override
    public Object findByKey(String key) {
        return redisTemplate.opsForValue().get(key);
    }

    @Override
    public void deleteByKey(String key) {
        redisTemplate.delete(key);
    }

}
