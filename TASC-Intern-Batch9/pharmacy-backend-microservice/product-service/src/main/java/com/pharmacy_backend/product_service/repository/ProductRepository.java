package com.pharmacy_backend.product_service.repository;

import com.pharmacy_backend.product_service.dto.request.ProductCMSFilterRequest;
import com.pharmacy_backend.product_service.dto.request.ProductFilterCustomerRequest;
import com.pharmacy_backend.product_service.entity.Brand;
import com.pharmacy_backend.product_service.entity.Category;
import com.pharmacy_backend.product_service.entity.Product;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ProductRepository {
    List<Product> findAll(int size, int offSet, ProductCMSFilterRequest filterRequest);

    List<Product> findAll(int size, int offSet, ProductFilterCustomerRequest filterCustomerRequest);

    Optional<Product> findById(Long id);

    Optional<Product> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<Product> findTop15ByActiveTrue();

    List<Product> findTop15ByBrandAndActive(Brand brand, boolean b);

    long countProducts(ProductCMSFilterRequest filterRequest);
    long countProducts(ProductFilterCustomerRequest filterCustomerRequest);
    long countProducts();

    Product createProduct(Product product);

    Product updateProduct(Long id, Product product);

    void deleteProduct(Long id);

    List<Product> updateAll(List<Product> products);
    List<Product> findAll(boolean active);
    List<Product> findByIdIn(List<Long> ids);

    Long findMaxId();
    Long findMinId();

    List<Product> findAllFromRange(Long startId, Long endId);
    List<Product> findAllByUpdatedAtBefore(int intervalSeconds);


    List<Product> findTop20ByCategoriesInAndIdNotAndActiveTrue(List<Category> categories, Long productId);
}
