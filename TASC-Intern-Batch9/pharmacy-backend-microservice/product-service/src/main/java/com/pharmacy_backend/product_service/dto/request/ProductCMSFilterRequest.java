package com.pharmacy_backend.product_service.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductCMSFilterRequest {
    String title;
    Boolean isAscending;
    Long priceFrom;
    Long priceTo;
    Boolean isActive;

    Long categoryId;
    Long brandId;

    public Boolean isActive() {
        if(isActive == null) return null;
        else return isActive;
    }

    public Boolean isAscending() {
        if(isAscending == null) return null;
        else return isAscending;
    }
}
