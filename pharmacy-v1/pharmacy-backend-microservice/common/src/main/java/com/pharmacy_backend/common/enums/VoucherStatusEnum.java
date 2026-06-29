package com.pharmacy_backend.common.enums;

import lombok.Getter;

@Getter
public enum VoucherStatusEnum {
    ACTIVE("Active"),
    INACTIVE("Inactive"),
    EXPIRED("Expired"),
    CANCELLED("Cancelled");

    private final String status;

    VoucherStatusEnum(String status) {
        this.status = status;
    }
}
