package com.pharmacy_backend.common.enums;

import lombok.Getter;

@Getter
public enum OrderStatusEnum {
    PENDING, SHIPPING, CANCELLED, DELIVERED, FAILED;

    public String getName() {
        return this.name();
    }
}
