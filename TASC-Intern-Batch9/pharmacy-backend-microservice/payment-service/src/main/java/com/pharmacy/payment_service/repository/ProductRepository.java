package com.pharmacy.payment_service.repository;


import com.pharmacy_backend.order_service.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
