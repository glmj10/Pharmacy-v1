package com.pharmacy_backend.product_service.service;

public interface StockCacheService {

    int reserveStock(Long productId, int quantity);

    int releaseStock(Long productId, int quantity);

    void setStock(Long productId, int quantity);

    Integer getStock(Long productId);

    void deleteStock(Long productId);
}
