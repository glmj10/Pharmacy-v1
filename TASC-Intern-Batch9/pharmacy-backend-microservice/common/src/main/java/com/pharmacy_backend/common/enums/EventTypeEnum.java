package com.pharmacy_backend.common.enums;

import lombok.Getter;

@Getter
public enum EventTypeEnum {
    USER_CREATED,
    PROFILE_CREATED,
    PROFILE_UPDATED,
    PROFILE_DELETED,
    USER_VERIFIED,
    PASSWORD_RESET;

    public String getName() {
        return this.name();
    }
}
