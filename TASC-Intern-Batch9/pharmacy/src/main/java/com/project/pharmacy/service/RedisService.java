package com.project.pharmacy.service;

public interface RedisService {
    void setValue(String key, String value);
    void setValue(String key, String value, long expirationSeconds);
    Object getValue(String key);
    void deleteValue(String key);
}