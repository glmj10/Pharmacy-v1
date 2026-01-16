package com.pharmacy_backend.common.enums;


import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum FileCategoryEnum {
    AVATAR("avatar"),
    BLOG("blog"),
    PRODUCT("product"),
    CATEGORY("category"),
    PROMOTION("promotion"),
    BANNER("banner")
    ;

    private final String subDirectory;

}
