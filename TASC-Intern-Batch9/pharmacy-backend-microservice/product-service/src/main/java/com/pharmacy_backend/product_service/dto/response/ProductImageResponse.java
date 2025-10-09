package com.pharmacy_backend.product_service.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductImageResponse {
    Long id;
    String imageUrl;
}
