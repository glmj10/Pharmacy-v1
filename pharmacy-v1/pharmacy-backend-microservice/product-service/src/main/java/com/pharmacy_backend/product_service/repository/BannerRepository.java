package com.pharmacy_backend.product_service.repository;

import com.pharmacy_backend.product_service.entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Long> {
    List<Banner> findByIsActiveOrderByPriorityAsc(boolean isActive);

    List<Banner> findByIsActive(Boolean isActive);
}
