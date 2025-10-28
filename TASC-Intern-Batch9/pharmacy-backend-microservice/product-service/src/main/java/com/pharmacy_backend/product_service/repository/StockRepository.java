package com.pharmacy_backend.product_service.repository;

import com.pharmacy_backend.product_service.entity.Product;
import com.pharmacy_backend.product_service.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {
    void deleteByProduct(Product product);

    Optional<Stock> findByProduct(Product product);
}
