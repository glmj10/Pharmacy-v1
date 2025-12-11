package com.pharmacy_backend.product_service.entity;

import com.pharmacy_backend.common.entity.base.BaseModifyEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "promotion_items")
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PromotionItem extends BaseModifyEntity {
    @Column(name = "promotion_event_id")
    Long promotionEventId;

    @Column(name = "product_id")
    Long productId;

    @Column(name = "sale_price")
    Integer salePrice;
}
