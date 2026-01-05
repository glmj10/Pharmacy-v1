package com.pharmacy_backend.order_service.service;

public interface RedisService {
    void deleteCacheKey(String key);
    void setCache(String key, Object value, long durationInSeconds);
    void addValueToSet(String key, String value);
}
