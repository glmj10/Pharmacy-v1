package com.pharmacy_backend.common.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductNeedToCheckStockRequest {
    Long productId;
    Integer requiredQuantity;
}
