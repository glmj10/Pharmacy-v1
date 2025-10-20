package com.pharmacy_backend.product_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class TypeResponse {
    private Long id;
    private String code;
    private String name;
}
