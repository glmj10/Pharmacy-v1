package com.pharmacy_backend.order_service.dto.projection;


public interface RevenueStatisticProjection {
    String getDate();
    Long getTotalRevenue();
    Long getOrderCount();
}
