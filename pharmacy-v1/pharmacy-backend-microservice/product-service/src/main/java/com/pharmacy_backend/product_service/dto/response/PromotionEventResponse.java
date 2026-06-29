package com.pharmacy_backend.product_service.dto.response;

import com.pharmacy_backend.common.enums.PromotionEventStatusEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromotionEventResponse {
    Long id;
    String name;
    String thumbnailUrl;
    LocalDateTime startTime;
    LocalDateTime endTime;
    PromotionEventStatusEnum status;
}
