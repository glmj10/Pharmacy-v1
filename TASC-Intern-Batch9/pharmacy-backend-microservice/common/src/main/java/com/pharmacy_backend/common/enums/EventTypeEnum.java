package com.pharmacy_backend.common.enums;

import lombok.Getter;

@Getter
public enum EventTypeEnum {
    USER_CREATED,
    PROFILE_CREATED,
    PROFILE_UPDATED,
    PROFILE_DELETED,
    USER_VERIFIED,
    CATEGORY_CREATED,
    CATEGORY_UPDATED,
    CATEGORY_DELETED,
    PRODUCT_CREATED,
    PRODUCT_UPDATED,
    PRODUCT_DELETED,
    ORDER_CREATED,
    ORDER_UPDATED,
    ORDER_DELETED,
    ORDER_RESERVED,
    ORDER_RELEASED,
    ORDER_RESERVATION_FAILED,
    ORDER_CANCELLED,
    PAYMENT_COMPLETED,
    PAYMENT_FAILED,
    PAYMENT_REFUNDED,

    PASSWORD_RESET;

    public String getName() {
        return this.name();
    }
}
