package com.pharmacy_backend.product_service.dto.response;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlashSaleItemResponse {
    Long flashSaleEventId;

    ProductResponse productResponse;

    Integer salePrice;

    Integer saleStock;
    int sold;
}
