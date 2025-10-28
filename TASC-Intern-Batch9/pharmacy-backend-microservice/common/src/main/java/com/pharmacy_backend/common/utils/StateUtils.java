package com.pharmacy_backend.common.utils;

import com.pharmacy_backend.common.enums.OrderStatusEnum;

public class StateUtils {

    public static boolean isValidTransition(OrderStatusEnum currentStatus, OrderStatusEnum newStatus) {
        return switch (currentStatus) {
            case PENDING -> newStatus == OrderStatusEnum.SHIPPING || newStatus == OrderStatusEnum.CANCELLED;
            case SHIPPING -> newStatus == OrderStatusEnum.DELIVERED || newStatus == OrderStatusEnum.CANCELLED;
            default -> false;
        };
    }
}
