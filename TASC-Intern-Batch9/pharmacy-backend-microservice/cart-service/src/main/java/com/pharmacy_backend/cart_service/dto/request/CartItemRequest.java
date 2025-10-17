package com.pharmacy_backend.cart_service.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemRequest {
    @NotNull(message = "Product ID không được để trống")
    private Long productId;

    @NotNull(message = "Số lượng không được để trống")
    private Integer quantity;
}
