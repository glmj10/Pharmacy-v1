package com.pharmacy_backend.common.utils;

import com.pharmacy_backend.common.enums.OrderStatusEnum;
import com.pharmacy_backend.common.enums.PaymentStatusEnum;

public class StateUtils {

    public static boolean isValidTransition(OrderStatusEnum currentStatus, OrderStatusEnum newStatus) {
        return switch (currentStatus) {
            case PENDING -> newStatus == OrderStatusEnum.SHIPPING || newStatus == OrderStatusEnum.CANCELLED;
            case SHIPPING -> newStatus == OrderStatusEnum.DELIVERED;
            default -> false;
        };
    }

    public static boolean isValidPaymentTransition(PaymentStatusEnum currentStatus, PaymentStatusEnum newStatus) {
        return switch (currentStatus) {
            case PENDING -> newStatus == PaymentStatusEnum.FAILED || newStatus == PaymentStatusEnum.COMPLETED;
            default -> false;
        };
    }

}
