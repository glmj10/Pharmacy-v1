package com.pharmacy_backend.order_service.dto.response;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherResponse {
    Long id;
    String code;
    String description;
    String discountType;
    String type;
    Integer discountValue;
    Integer collectedCount;
    Integer maxDiscountAmount;
    Integer minOrderValue;
    Integer usageLimit;
    Integer usageLimitPerUser;
    String status;
    LocalDateTime startDate;
    LocalDateTime endDate;
    boolean isClaimed;
    boolean isUsed;
}
