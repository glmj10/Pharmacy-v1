package com.pharmacy.payment_service.dto.response;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductResponse {
    Long id;
    String thumbnailUrl;
    String title;
    Integer priceOld;
    Integer priceNew;
    String slug;
    Boolean active;
}
