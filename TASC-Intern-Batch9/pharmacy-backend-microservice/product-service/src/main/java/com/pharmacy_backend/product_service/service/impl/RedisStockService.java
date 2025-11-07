package com.pharmacy_backend.product_service.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmacy_backend.common.enums.ErrorCode;
import com.pharmacy_backend.common.enums.RedisKeyTypeEnum;
import com.pharmacy_backend.common.exceptions.CustomException;
import com.pharmacy_backend.product_service.service.StockCacheService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class RedisStockService implements StockCacheService {
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    private static final String STOCK_KEY_PREFIX = RedisKeyTypeEnum.PRODUCT_STOCK.getKey();
    private static final String STOCK_DECREASE_LUA = """
                    local key = KEYS[1]
                    local qty = tonumber(ARGV[1])
                    local stock = tonumber(redis.call('GET', key))
                    if not stock then
                      return -1
                    end
                    if stock < qty then
                      return 0
                    end
                    redis.call('DECRBY', key, qty)
                    return 1
            """;


    @Override
    public boolean decreaseStock(Long productId, int quantity) {
        String key = STOCK_KEY_PREFIX + ":" + productId;
        Long result = redisTemplate.execute(new DefaultRedisScript<>(STOCK_DECREASE_LUA, Long.class),
                Collections.singletonList(key), String.valueOf(quantity)
                );

        return switch (result.intValue()) {
            case 1 -> true; // Stock decreased successfully
            case 0 -> false; // Not enough stock
            case -1 -> throw new CustomException(ErrorCode.STOCK_NOT_FOUND); // Stock not found
            default -> false;
        };
    }

    @Override
    public Integer getStock(Long productId) {
        String key = STOCK_KEY_PREFIX + ":" + productId;
        String stockJson = redisTemplate.opsForValue().get(key);
        if(stockJson != null) {
            try {
                return objectMapper.convertValue(stockJson, Integer.class);
            } catch (Exception e) {
                throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR, "Failed to parse cached product data");
            }
        }

        return null;
    }

    @Override
    public void setStock(Long productId, int quantity) {
        String key = STOCK_KEY_PREFIX + ":" + productId;
        try {
            String json = objectMapper.writeValueAsString(quantity);
            redisTemplate.opsForValue().set(key, json);
        } catch (Exception e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR, "Failed to cache product stock data");
        }
    }

    @Override
    public void deleteStock(Long productId) {
        String key = STOCK_KEY_PREFIX + ":" + productId;
        redisTemplate.delete(key);
    }

}
