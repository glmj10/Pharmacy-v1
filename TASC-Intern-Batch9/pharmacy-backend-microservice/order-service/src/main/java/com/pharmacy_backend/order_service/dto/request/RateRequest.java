package com.pharmacy_backend.order_service.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class RateRequest {
    @NotNull(message = "Số rating không được để trống")
    @Max(value = 5, message = "Số rating phải từ 1 đến 5")
    @Min(value = 1, message = "Số rating phải từ 1 đến 5")
    Integer rating;

    @NotNull(message = "orderDetailId không được để trống")
    Long orderDetailId;
    String comment;
}
