package com.pharmacy_backend.cart_service.service.impl;

import com.pharmacy_backend.cart_service.entity.Product;
import com.pharmacy_backend.cart_service.mapper.ProductMapper;
import com.pharmacy_backend.cart_service.repository.ProductRepository;
import com.pharmacy_backend.cart_service.service.ProductService;
import com.pharmacy_backend.common.kafka.event.ProductEvent;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
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

    @Override
    public void updateAll(Set<ProductEvent> productEvents) {
        Set<Product> products = productEvents.stream()
                .map(productEvent -> {
                    Product product = productMapper.toProduct(productEvent);
                    product.setId(productEvent.getProductId());
                    return product;
                })
                .collect(java.util.stream.Collectors.toSet());
        productRepository.saveAll(products);
    }
}
