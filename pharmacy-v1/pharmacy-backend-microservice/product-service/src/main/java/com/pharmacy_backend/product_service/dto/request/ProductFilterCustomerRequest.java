package com.pharmacy_backend.product_service.dto.request;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductFilterCustomerRequest {
    String title;
    Long priceFrom;
    Long priceTo;
    Boolean isAscending;

    String brandSlug;
    String category;

    public Boolean isAscending() {
        return isAscending != null && isAscending;
    }

}
