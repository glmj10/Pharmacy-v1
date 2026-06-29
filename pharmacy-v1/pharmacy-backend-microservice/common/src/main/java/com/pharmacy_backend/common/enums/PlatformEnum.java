package com.pharmacy_backend.common.enums;

import lombok.Getter;

@Getter
public enum PlatformEnum {
    WEB("WEB"),
    MOBILE("MOBILE");

    private final String name;

    PlatformEnum(String name) {
        this.name = name;
    }
}
