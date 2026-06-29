package com.pharmacy_backend.cart_service.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class CartItemResponse {
    Long id;
    ProductResponse product;
    Integer quantity;
    Integer priceAtAddition;
    Integer priceDifferent;
    String priceChangeType;
    Boolean selected;
    Boolean isOutOfStock;
}
