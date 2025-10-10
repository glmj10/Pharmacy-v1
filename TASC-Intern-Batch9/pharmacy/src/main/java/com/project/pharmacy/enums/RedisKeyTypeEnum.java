package com.project.pharmacy.enums;

import lombok.Getter;

@Getter
public enum RedisKeyTypeEnum {
    INVALIDATED_JWT("INVALIDATED_JWT"),
    RESET_PASSWORD_TOKEN("RESET_PASSWORD_TOKEN"),
    VERIFICATION_TOKEN("VERIFICATION_TOKEN"),
    USER_VERSION("USER_VERSION");

    private final String key;
    RedisKeyTypeEnum(String key) {
        this.key = key;
    }

}
