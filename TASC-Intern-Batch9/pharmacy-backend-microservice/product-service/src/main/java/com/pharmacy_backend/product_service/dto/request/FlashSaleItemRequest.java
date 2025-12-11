package com.pharmacy_backend.product_service.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlashSaleItemRequest {
    @NotNull(message = "Mã sự kiện giảm giá không được để trống")
    Long flashSaleEventId;

    @NotNull(message = "Mã sản phẩm không được để trống")
    Long productId;

    @NotNull(message = "Giá sale không được để trống")
    Integer salePrice;

    @NotNull(message = "Số lượng hàng sale không được để trống")
    Integer saleStock;
}
