package com.pharmacy_backend.common.kafka.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
@Builder
public class OrderDetailEvent {
    long quantity;
    Long productId;
    String title;
    long priceAtOrder;

    public OrderDetailEvent(long quantity, Long productId) {
        this.quantity = quantity;
        this.productId = productId;
    }
}
