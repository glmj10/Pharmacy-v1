package com.pharmacy_backend.product_service.repository;

import com.pharmacy_backend.product_service.entity.PromotionItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PromotionItemRepository extends JpaRepository<PromotionItem, Long> {
    Page<PromotionItem> findByPromotionEventId(Long promotionEventId, Pageable pageable);

    List<PromotionItem> findByPromotionEventId(Long promotionEventId);
    boolean existsByProductId(Long productId);

    @Query("""
            SELECT pi FROM PromotionItem pi 
            WHERE pi.promotionEventId <> :promotionEventId AND pi.productId IN :productIds
            """)
    List<PromotionItem> findAllByPromotionIdDifferentEvent(Long promotionEventId, List<Long> productIds);



    @Query("""
            SELECT pi FROM PromotionItem pi 
            WHERE pi.promotionEventId = :promotionEventId AND pi.productId IN :productIds
            """)
    List<PromotionItem> findAllExistInEvent(Long promotionEventId, List<Long> productIds);


    @Query("""
                        SELECT pi FROM PromotionItem pi 
                        JOIN Product p ON pi.productId = p.id
                        WHERE pi.promotionEventId = :promotionEventId AND pi.productId IN :productIds
                        AND pi.salePrice > p.priceNew
            """)
    List<PromotionItem> findAllBySalePriceDiffFromProduct(Long promotionEventId, List<Long> productIds);
}
