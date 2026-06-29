package com.pharmacy_backend.product_service.repository;

import com.pharmacy_backend.common.enums.PromotionEventStatusEnum;
import com.pharmacy_backend.product_service.entity.PromotionEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

public interface PromotionEventRepository extends JpaRepository<PromotionEvent, Long> {
    Page<PromotionEvent> findAll(Pageable pageable);

    Optional<PromotionEvent> findByIdAndStatus(Long id, PromotionEventStatusEnum status);

    @Query(value = "SELECT * FROM promotion_events" +
            " WHERE status = 'ONGOING'", nativeQuery = true)
    List<PromotionEvent> findCurrentPromotionEvents();
}
