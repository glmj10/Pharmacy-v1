package com.pharmacy_backend.product_service.entity;


import com.pharmacy_backend.common.entity.base.BaseEntity;
import com.pharmacy_backend.common.enums.PromotionEventStatusEnum;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "promotion_events")
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PromotionEvent extends BaseEntity {
    String thumbnailUrl;
    String thumbnailUUID;

    String name;

    @Column(name = "start_time")
    LocalDateTime startTime;

    @Column(name = "end_time")
    LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    PromotionEventStatusEnum status = PromotionEventStatusEnum.UPCOMING;
}
