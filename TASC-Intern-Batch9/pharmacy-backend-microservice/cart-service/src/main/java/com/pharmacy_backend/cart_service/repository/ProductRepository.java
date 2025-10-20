package com.pharmacy_backend.cart_service.repository;

import com.pharmacy_backend.cart_service.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
