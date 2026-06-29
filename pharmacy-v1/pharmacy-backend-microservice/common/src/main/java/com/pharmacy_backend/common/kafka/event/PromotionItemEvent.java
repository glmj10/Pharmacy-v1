package com.pharmacy_backend.common.kafka.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromotionItemEvent {
    private Long productId;
    private Integer salePrice;
}
