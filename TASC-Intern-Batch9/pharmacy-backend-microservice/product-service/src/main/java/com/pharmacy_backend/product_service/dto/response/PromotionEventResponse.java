package com.pharmacy_backend.product_service.dto.response;

import com.pharmacy_backend.common.enums.FlashSaleEventStatusEnum;
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
    LocalDateTime startTime;
    LocalDateTime endTime;
    FlashSaleEventStatusEnum status;
}
