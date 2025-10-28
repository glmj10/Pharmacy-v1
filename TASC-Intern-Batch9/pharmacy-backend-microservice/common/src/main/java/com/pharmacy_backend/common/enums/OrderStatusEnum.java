package com.pharmacy_backend.common.enums;

import lombok.Getter;

@Getter
public enum OrderStatusEnum {
    PENDING, SHIPPING, CANCELLED, DELIVERED;

    public String getName() {
        return this.name();
    }
}
