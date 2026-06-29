package com.pharmacy_backend.product_service.service.impl;

import com.pharmacy_backend.common.enums.RedisKeyTypeEnum;
import com.pharmacy_backend.product_service.service.StockCacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisStockService implements StockCacheService {

    private final RedisTemplate<String, String> redisTemplate;

    private static final String STOCK_KEY_PREFIX = RedisKeyTypeEnum.PRODUCT_STOCK.getKey();
    private static final long   TTL_SECONDS      = RedisKeyTypeEnum.PRODUCT_STOCK.getDuration();

    private static final String LUA_RESERVE_STOCK = """
            local stockKey = KEYS[1]
            local qty      = tonumber(ARGV[1])

            local stock = tonumber(redis.call('GET', stockKey))
            if not stock then
              return -1
            end
            if stock < qty then
              return 0
            end

            redis.call('SET', stockKey, tostring(stock - qty))
            return 1
            """;

    private static final String LUA_RELEASE_STOCK = """
            local stockKey = KEYS[1]
            local qty      = tonumber(ARGV[1])

            local stock = tonumber(redis.call('GET', stockKey))
            if not stock then
              return -1
            end

            redis.call('SET', stockKey, tostring(stock + qty))
            return 1
            """;

    private String stockKey(Long productId) {
        return STOCK_KEY_PREFIX + ":" + productId;
    }

    @Override
    public int reserveStock(Long productId, int quantity) {
        List<String> keys = Collections.singletonList(stockKey(productId));
        Long result = redisTemplate.execute(
                new DefaultRedisScript<>(LUA_RESERVE_STOCK, Long.class),
                keys,
                String.valueOf(quantity)
        );
        return result != null ? result.intValue() : -1;
    }

    @Override
    public int releaseStock(Long productId, int quantity) {
        List<String> keys = Collections.singletonList(stockKey(productId));
        Long result = redisTemplate.execute(
                new DefaultRedisScript<>(LUA_RELEASE_STOCK, Long.class),
                keys,
                String.valueOf(quantity)
        );
        return result != null ? result.intValue() : -1;
    }

    @Override
    public void setStock(Long productId, int quantity) {
        redisTemplate.opsForValue().set(stockKey(productId), String.valueOf(quantity), TTL_SECONDS, TimeUnit.SECONDS);
    }

    @Override
    public Integer getStock(Long productId) {
        String val = redisTemplate.opsForValue().get(stockKey(productId));
        if (val == null) return null;
        try {
            return Integer.parseInt(val);
        } catch (NumberFormatException e) {
            log.warn("Không thể parse stock cho product {}: {}", productId, val);
            return null;
        }
    }

    @Override
    public void deleteStock(Long productId) {
        redisTemplate.delete(stockKey(productId));
    }
}
