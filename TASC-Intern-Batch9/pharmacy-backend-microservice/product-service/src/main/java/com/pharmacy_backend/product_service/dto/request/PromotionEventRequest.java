package com.pharmacy_backend.product_service.dto.request;

import com.pharmacy_backend.common.enums.PromotionEventStatusEnum;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromotionEventRequest {

    @NotNull(message = "Tên sự kiện không được để trống")
    @NotEmpty(message = "Tên sự kiện không được để trống")
    String name;

    LocalDateTime startTime;
    LocalDateTime endTime;
}
