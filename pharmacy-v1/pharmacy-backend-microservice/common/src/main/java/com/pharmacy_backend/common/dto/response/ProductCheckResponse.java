package com.pharmacy_backend.common.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductCheckResponse {
    private Long productId;
    private Integer priceNew;
    private Integer requestedQuantity;
}
