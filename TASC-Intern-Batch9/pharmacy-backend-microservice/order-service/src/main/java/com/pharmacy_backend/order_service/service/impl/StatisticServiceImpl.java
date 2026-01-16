package com.pharmacy_backend.order_service.service.impl;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.order_service.dto.projection.RevenueStatisticProjection;
import com.pharmacy_backend.order_service.repository.OrderRepository;
import com.pharmacy_backend.order_service.service.StatisticService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StatisticServiceImpl implements StatisticService {
    private final OrderRepository orderRepository;

    @Override
    public ApiResponse<List<RevenueStatisticProjection>> getRevenueStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        List<RevenueStatisticProjection> statistics = orderRepository.getRevenueStatistics(startDate, endDate);
        return ApiResponse.buildOkResponse(statistics, "Lấy thống kê doanh thu thành công");
    }
}
