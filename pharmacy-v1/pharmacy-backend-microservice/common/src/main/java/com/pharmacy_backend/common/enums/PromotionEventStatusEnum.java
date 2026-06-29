package com.pharmacy_backend.common.enums;

import lombok.Getter;

@Getter
public enum PromotionEventStatusEnum {
    UPCOMING,
    ONGOING,
    CANCELLED,
    ENDED;

    public String getName() {
        return this.name();
    }
}

