package com.pharmacy_backend.order_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RateResponse {
    private Long id;
    private Integer rating;
    private String comment;
    private UserResponse userResponse;
}
