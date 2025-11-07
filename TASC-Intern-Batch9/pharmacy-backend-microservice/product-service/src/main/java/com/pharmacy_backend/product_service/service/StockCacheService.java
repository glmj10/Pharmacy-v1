package com.pharmacy_backend.product_service.service;

public interface StockCacheService {
    boolean decreaseStock(Long productId, int quantity);
    Integer getStock(Long productId);
    void setStock(Long productId, int quantity);
    void deleteStock(Long productId);
}
