package com.pharmacy.payment_service.dto.response;

import com.pharmacy_backend.order_service.dto.response.CartItemResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class CartResponse {
    private Long id;
    private Long totalPrice;
    private List<CartItemResponse> cartItems;
}
