package com.pharmacy_backend.product_service.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromotionItemRequest {
    @NotNull(message = "Mã sản phẩm không được để trống")
    Long productId;

    @NotNull(message = "Giá sale không được để trống")
    Integer salePrice;
}
