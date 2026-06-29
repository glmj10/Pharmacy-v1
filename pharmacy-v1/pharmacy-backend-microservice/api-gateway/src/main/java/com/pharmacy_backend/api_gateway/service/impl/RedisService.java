package com.pharmacy_backend.api_gateway.service.impl;

import com.pharmacy_backend.common.enums.RedisKeyTypeEnum;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class RedisService {
    private final RedisTemplate<String, Object> redisTemplate;

    public Object getValue(String key) {
        return redisTemplate.opsForValue().get(key);
    }

    public Integer getUserVersion(Long userId) {
        Object version = redisTemplate.opsForValue().get(RedisKeyTypeEnum.USER_VERSION.getKey()
                + ":" + userId);
        return version != null ? Integer.parseInt(version.toString()) : null;
    }

    public void storeInvalidatedToken(String jti, long expirationTime) {
        long expirationMillis = expirationTime - new Date().getTime();
        redisTemplate.opsForValue().set(RedisKeyTypeEnum.INVALIDATED_JWT.getKey()
                + ":" + jti, "invalid", expirationMillis, TimeUnit.MILLISECONDS);
    }
}
