package com.pharmacy_backend.common.enums;

import lombok.Getter;

@Getter
public enum FlashSaleEventStatusEnum {
    UPCOMING,
    ONGOING,
    ENDED;

    public String getName() {
        return this.name();
    }
}

