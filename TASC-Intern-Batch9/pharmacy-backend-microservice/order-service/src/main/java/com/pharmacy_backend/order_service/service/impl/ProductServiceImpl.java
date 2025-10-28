package com.pharmacy_backend.order_service.service.impl;

import com.pharmacy_backend.common.kafka.event.ProductEvent;
import com.pharmacy_backend.order_service.entity.Product;
import com.pharmacy_backend.order_service.mapper.ProductMapper;
import com.pharmacy_backend.order_service.repository.ProductRepository;
import com.pharmacy_backend.order_service.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @Override
    public void createProduct(ProductEvent productEvent) {
        Product product = productMapper.toProduct(productEvent);
        productRepository.save(product);
    }

    @Override
    public void updateProduct(ProductEvent productEvent) {
        Product product = productMapper.toProduct(productEvent);
        productRepository.save(product);
    }

    @Override
    public void deleteProduct(Long productId) {
        productRepository.deleteById(productId);
    }

    @Override
    public void changeProductStatus(Long productId, Boolean active) {
        Product product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Product not found"));
        product.setActive(active);
        productRepository.save(product);
    }
}
