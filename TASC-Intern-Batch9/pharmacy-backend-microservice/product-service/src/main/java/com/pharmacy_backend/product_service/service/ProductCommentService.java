package com.pharmacy_backend.product_service.service;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.product_service.dto.request.RateRequest;

public interface ProductRatingService {
    ApiResponse<Void> rateProduct(RateRequest request);

}
