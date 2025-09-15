package com.project.pharmacy.dto.request;

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

    String brand;
    String category;

    public Boolean isAscending() {
        return isAscending != null && isAscending;
    }

}
