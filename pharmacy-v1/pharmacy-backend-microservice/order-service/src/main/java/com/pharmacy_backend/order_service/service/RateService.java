package com.pharmacy_backend.order_service.service;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.PageResponse;
import com.pharmacy_backend.order_service.dto.request.RateRequest;
import com.pharmacy_backend.order_service.dto.response.RateResponse;

import java.util.List;

public interface RateService {
    ApiResponse<PageResponse<List<RateResponse>>> getRatesByProductId(Long productId,
                                                            Integer pageIndex,
                                                            Integer pageSize, Integer rating);

    ApiResponse<Void> createRate(RateRequest request);
}
