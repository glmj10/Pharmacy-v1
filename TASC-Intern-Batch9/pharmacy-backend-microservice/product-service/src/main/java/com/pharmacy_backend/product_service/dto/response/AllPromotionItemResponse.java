package com.pharmacy_backend.product_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AllPromotionItemResponse {
    Long promotionEventId;
    Long totalRequested;
    long successCount;
    long failedCount;

    List<PromotionItemResponse> successItems;
    List<PromotionItemResponse> failedItems;
}
