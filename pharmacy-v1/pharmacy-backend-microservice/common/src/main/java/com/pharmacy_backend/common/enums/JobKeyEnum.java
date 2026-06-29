package com.pharmacy_backend.common.enums;

import lombok.Getter;

@Getter
public enum JobKeyEnum {
    PROMOTION_START("promotion_start"),
    PROMOTION_END("promotion_end"),
    VOUCHER_ACTIVE("voucher_active"),
    VOUCHER_EXPIRE("voucher_expire");

    private final String key;

    JobKeyEnum(String key) {
        this.key = key;
    }
}
