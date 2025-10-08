package com.pharmacy_backend.product_service.dto.request;


import jakarta.validation.constraints.NotEmpty;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BrandRequest {
    @NotEmpty(message = "Tên thương hiệu không được để trống")
    String name;

    @NotEmpty(message = "Mô tả thương hiệu không được để trống")
    String description;
}
