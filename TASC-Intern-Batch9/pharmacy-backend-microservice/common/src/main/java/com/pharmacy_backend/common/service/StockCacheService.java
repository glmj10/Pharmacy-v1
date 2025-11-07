package com.pharmacy_backend.common.service;

public interface StockCacheService {
    boolean decreaseStock(Long productId, int quantity);
}
