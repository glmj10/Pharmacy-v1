package com.pharmacy_backend.order_service.repository;

import com.pharmacy_backend.order_service.entity.Rate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RateRepository extends JpaRepository<Rate, Long> {
    Page<Rate> findAllByProductId(Long productId, Pageable pageable);
}
