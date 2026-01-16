package com.pharmacy_backend.common.service;

import java.util.Set;

public interface RedisService {
    void deleteCacheKey(String key);
    void setCache(String key, String value, long duration);
    void addValueToSet(String key, String[] value, long duration);
    void addValueToSet(String key, String value, long duration);
    String getCache(String key);
    Set<String> getSetMembers(String key);
    void removeSetMember(String key, String ...value);
    void removeAllSetMembers(String key);
}
