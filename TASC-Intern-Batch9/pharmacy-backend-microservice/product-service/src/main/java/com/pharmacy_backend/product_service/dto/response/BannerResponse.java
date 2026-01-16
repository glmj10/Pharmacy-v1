package com.pharmacy_backend.product_service.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BannerResponse {
    Long id;
    String name;
    String imageUrl;
    String targetUrl;
    String type;
    int priority;
}
