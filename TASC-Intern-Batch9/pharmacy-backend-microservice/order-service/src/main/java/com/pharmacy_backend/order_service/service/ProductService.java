package com.pharmacy_backend.order_service.service;

import com.pharmacy_backend.common.kafka.event.ProductEvent;

public interface ProductService {
    void createProduct(ProductEvent productEvent);
    void updateProduct(ProductEvent productEvent);
    void deleteProduct(Long productId);
    void changeProductStatus(Long productId, Boolean active);
}
