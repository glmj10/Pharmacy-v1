package com.pharmacy_backend.product_service.repository;

import com.pharmacy_backend.product_service.entity.Brand;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Long> {
    Page<Brand> findByNameContainingIgnoreCase(String name, Pageable pageable);
    boolean existsBySlug(String slug);

    Brand findBySlug(String slug);
}
