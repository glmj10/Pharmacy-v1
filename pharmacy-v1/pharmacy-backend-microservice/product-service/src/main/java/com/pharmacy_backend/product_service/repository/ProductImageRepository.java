package com.pharmacy_backend.product_service.repository;

import com.pharmacy_backend.product_service.entity.Product;
import com.pharmacy_backend.product_service.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    List<ProductImage> findByProduct(Product product);

    void deleteByProduct(Product product);
}
