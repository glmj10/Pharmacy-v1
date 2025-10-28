package com.pharmacy_backend.common.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductItemError {
    private Long productId;
    private String productName;
    private String errorCode;
    private String message;
}
