package com.project.pharmacy.repository;

import com.project.pharmacy.entity.Product;
import com.project.pharmacy.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    List<ProductImage> findByProduct(Product product);

    void deleteByProduct(Product product);
}
