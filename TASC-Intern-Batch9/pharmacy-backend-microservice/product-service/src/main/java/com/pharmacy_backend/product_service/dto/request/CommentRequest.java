package com.pharmacy_backend.product_service.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Range;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RateRequest {
    @Range(min = 1, max = 5, message = "Đánh giá phải từ 1 đến 5 sao")
    private Integer rating;
    private String content;

    @NotNull(message = "Mã sản phẩm không được để trống")
    private Integer productId;
}
