package com.pharmacy_backend.common.enums;

import lombok.Getter;

@Getter
public enum VoucherTypeEnum {
    PUBLIC("public"),
    PRIVATE("private");

    private final String description;

    VoucherTypeEnum(String description) {
        this.description = description;
    }
}
