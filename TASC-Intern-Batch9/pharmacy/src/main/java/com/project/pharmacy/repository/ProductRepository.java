package com.project.pharmacy.repository;

import com.project.pharmacy.dto.request.ProductCMSFilterRequest;
import com.project.pharmacy.dto.request.ProductFilterCustomerRequest;
import com.project.pharmacy.entity.Brand;
import com.project.pharmacy.entity.Product;
import org.springframework.data.domain.Pageable;

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
}
