package com.pharmacy_backend.product_service.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AllPromotionItemRequest {
    @NotNull(message = "Mã sự kiện giảm giá không được để trống")
    Long promotionEventId;

    @NotEmpty(message = "Danh sách sản phẩm không được để trống")
    List<PromotionItemRequest> promotionItemRequests;
}
