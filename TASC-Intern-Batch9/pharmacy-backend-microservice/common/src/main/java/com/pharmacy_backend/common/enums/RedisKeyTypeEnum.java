package com.pharmacy_backend.common.enums;

import lombok.Getter;

@Getter
public enum RedisKeyTypeEnum {
    INVALIDATED_JWT("INVALIDATED_JWT"),
    RESET_PASSWORD_TOKEN("RESET_PASSWORD_TOKEN"),
    RESET_PASSWORD_OTP("RESET_PASSWORD_OTP"),
    VERIFICATION_TOKEN("VERIFICATION_TOKEN"),
    VERIFICATION_OTP("VERIFICATION_OTP"),
    USER_VERSION("USER_VERSION"),
    PRODUCT_DETAIL("PRODUCT_DETAIL"),
    RELATED_PRODUCTS("RELATED_PRODUCTS"),
    WISHLIST("WISHLIST"),
    PRODUCT_STOCK("PRODUCT_STOCK"),
    USER_CLICK("USER_CLICK"),
    LAST_RUN_TIME("LAST_RUN_TIME"),
    FLASH_SALE_EVENT("FLASH_SALE_EVENT");


    private final String key;
    RedisKeyTypeEnum(String key) {
        this.key = key;
    }

    public long getDuration() {
        return switch (this) {
            case INVALIDATED_JWT -> 60 * 60L; // 1 hour
            case RESET_PASSWORD_TOKEN -> 15 * 60L; // 15 minutes
            case VERIFICATION_TOKEN -> 24 * 60 * 60L; // 24 hours
            case USER_VERSION, WISHLIST -> 7 * 24 * 60 * 60L; // 7 days
            case PRODUCT_DETAIL, RELATED_PRODUCTS -> 6 * 60 * 60L; // 6 hours
            case PRODUCT_STOCK, LAST_RUN_TIME -> 0L;
            case RESET_PASSWORD_OTP -> 5 * 60L; // 5 minutes
            case VERIFICATION_OTP -> 12 * 60 * 60L; // 12 hours
            case USER_CLICK -> 60L; // 1 minute
            case FLASH_SALE_EVENT -> 2 * 60 * 60L; // 2 hours
        };
    }

}
