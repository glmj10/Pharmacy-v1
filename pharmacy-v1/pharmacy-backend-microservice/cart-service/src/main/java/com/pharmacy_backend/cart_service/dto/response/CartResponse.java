package com.pharmacy_backend.cart_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class CartResponse {
    private Long id;
    private List<CartItemResponse> cartItems;
}
