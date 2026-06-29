package com.pharmacy_backend.common.enums;

import lombok.Getter;

@Getter
public enum PaymentStatusEnum {
    PENDING, COMPLETED, FAILED;

    public String getName() {
        return this.name();
    }
}
