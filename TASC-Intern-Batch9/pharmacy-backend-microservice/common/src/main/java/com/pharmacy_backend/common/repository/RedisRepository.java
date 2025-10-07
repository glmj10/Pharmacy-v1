package com.pharmacy_backend.common.repository;

public interface RedisRepository {
    void save(String key, Object value, long timeout);
    void save(String key, Object value);
    Object findByKey(String key);
    void deleteByKey(String key);
}
