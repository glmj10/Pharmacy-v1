package com.pharmacy_backend.product_service.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BannerRequest {
    @NotEmpty(message = "Tên banner không được để trống")
    String name;
    String targetUrl;

    @NotEmpty(message = "Loại banner không được để trống")
    String type;
    int priority;
    Boolean isActive;
}
