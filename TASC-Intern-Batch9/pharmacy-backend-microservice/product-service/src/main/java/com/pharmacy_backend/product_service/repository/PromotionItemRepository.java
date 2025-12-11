package com.pharmacy_backend.product_service.repository;

import com.pharmacy_backend.product_service.entity.PromotionItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PromotionItemRepository extends JpaRepository<PromotionItem, Long> {
    Page<PromotionItem> findByFlashSaleEventId(Long flashSaleEventId, Pageable pageable);

    boolean existsByProductId(Long productId);
}
