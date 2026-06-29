package com.pharmacy_backend.product_service.dto.response;

import com.pharmacy_backend.product_service.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AgentResponse {
    private String message;
    private List<ProductResponse> products;
}
