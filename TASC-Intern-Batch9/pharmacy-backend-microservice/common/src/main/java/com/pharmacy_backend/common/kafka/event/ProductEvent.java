package com.pharmacy_backend.common.kafka.event;


import lombok.*;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductEvent {
    Long productId;
    String title;
    Integer priceOld;
    Integer priceNew;
    String slug;
    String thumbnailUrl;
    Boolean active;
    Integer quantity;
}
