package com.pharmacy_backend.order_service.service.impl;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.enums.ErrorCode;
import com.pharmacy_backend.common.exceptions.CustomException;
import com.pharmacy_backend.order_service.dto.projection.RevenueStatisticProjection;
import com.pharmacy_backend.order_service.dto.projection.TotalOrderStatusProjection;
import com.pharmacy_backend.order_service.repository.OrderRepository;
import com.pharmacy_backend.order_service.service.StatisticService;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.shaded.com.google.protobuf.Api;
import org.springframework.http.HttpStatus;
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

    @Override
    public ApiResponse<List<RevenueStatisticProjection>> getRevenueStatistics(Integer days) {
        if(days == null || days <= 0) {
            throw new CustomException(ErrorCode.INVALID_DATE_TIME, HttpStatus.BAD_REQUEST);
        }

        if(days > 1825) {
            days = 1825;
        }

        List<RevenueStatisticProjection> statistics;

        if(days >= 365 * 2) {
            statistics = orderRepository.getRevenueStatisticsByYear(days);
        } else if(days >= 90) {
            statistics = orderRepository.getRevenueStatisticsByMonth(days);
        } else if(days >= 14) {
            statistics = orderRepository.getRevenueStatisticsByWeek(days);
        } else {
            statistics = orderRepository.getRevenueStatisticsByDate(days);
        }

        return ApiResponse.buildOkResponse(statistics, "Lấy dữ liệu thống kê thành công");
    }

    @Override
    public ApiResponse<List<TotalOrderStatusProjection>> getTotalOrdersByStatus() {
        List<TotalOrderStatusProjection> totalOrderStatusProjections = orderRepository.getTotalOrderStatus();
        return ApiResponse.buildOkResponse(totalOrderStatusProjections, "Lấy thống kê đơn hàng theo trạng thái thành công");
    }
}
