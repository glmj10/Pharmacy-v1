package com.project.pharmacy.dto.request;

import lombok.Data;

@Data
public class CartItemRequest {
    private Long productId;
    private Long quantity;
}
