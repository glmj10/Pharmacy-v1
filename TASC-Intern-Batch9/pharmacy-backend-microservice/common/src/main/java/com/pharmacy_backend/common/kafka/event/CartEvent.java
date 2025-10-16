package com.pharmacy_backend.common.kafka.event;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CartEvent {
    private Long userId;
}
