package com.pharmacy_backend.product_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromotionItemResponse {
    Long id;
    Integer salePrice;
    Long productId;
    ProductResponse product;
    String errorCode;
    String message;
}