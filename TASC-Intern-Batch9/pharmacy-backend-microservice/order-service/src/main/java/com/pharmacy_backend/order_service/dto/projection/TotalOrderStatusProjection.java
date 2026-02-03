package com.pharmacy_backend.order_service.dto.projection;

public interface TotalOrderStatusProjection {
    String getStatus();
    Long getCount();
}
