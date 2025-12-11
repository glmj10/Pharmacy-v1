package com.pharmacy_backend.product_service.repository;

import com.pharmacy_backend.product_service.entity.PromotionEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface PromotionEventRepository extends JpaRepository<PromotionEvent, Long> {
    Page<PromotionEvent> findAll(Pageable pageable);

    @Query(value = "SELECT fse FROM FlashSaleEvent fse " +
            "WHERE CURRENT_TIMESTAMP BETWEEN fse.startTime AND fse.endTime", nativeQuery = true)
    List<PromotionEvent> findCurrentFlashSaleEvents();
}
