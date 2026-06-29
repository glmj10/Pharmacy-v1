package com.pharmacy_backend.common.enums;


import lombok.Getter;

@Getter
public enum TopicEnum {
    USER_TOPIC,
    PROFILE_TOPIC,
    CART_TOPIC,
    CATEGORY_TOPIC,
    PRODUCT_TOPIC,
    PAYMENT_TOPIC,
    VOUCHER_TOPIC,
    FILE_TOPIC,
    ORDER_TOPIC;

    public String getName() {
        return this.name();
    }
}
