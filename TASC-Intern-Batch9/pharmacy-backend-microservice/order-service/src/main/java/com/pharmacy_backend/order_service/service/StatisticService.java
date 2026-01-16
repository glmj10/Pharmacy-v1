package com.pharmacy_backend.order_service.service;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.order_service.dto.projection.RevenueStatisticProjection;

import java.time.LocalDateTime;
import java.util.List;

public interface StatisticService {
    ApiResponse<List<RevenueStatisticProjection>> getRevenueStatistics(LocalDateTime startDate, LocalDateTime endDate);
}
