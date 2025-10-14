package com.pharmacy_backend.common.enums;

import lombok.Getter;

@Getter
public enum RedisKeyTypeEnum {
    INVALIDATED_JWT,
    RESET_PASSWORD_TOKEN,
    VERIFICATION_TOKEN,
    USER_VERSION;

    public String getKey() {
        return this.name();
    }
}
