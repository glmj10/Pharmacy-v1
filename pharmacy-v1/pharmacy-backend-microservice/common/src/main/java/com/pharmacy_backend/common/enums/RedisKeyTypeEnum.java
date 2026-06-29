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
    PROMOTION_EVENT("PROMOTION_EVENT"),
    VOUCHER("VOUCHER"),
    USER_CLAIMED_VOUCHER("USER:CLAIMED"),
    STOCK("STOCK"),
    LIMIT("LIMIT"),
    CLAIMED("CLAIMED"),
    WISHLIST_USER("WISHLIST_USER");


    private final String key;
    RedisKeyTypeEnum(String key) {
        this.key = key;
    }

    public long getDuration() {
        return switch (this) {
            case INVALIDATED_JWT, PRODUCT_STOCK, LAST_RUN_TIME, PRODUCT_DETAIL, RELATED_PRODUCTS -> 60 * 60L; // 1 hour
            case RESET_PASSWORD_TOKEN -> 15 * 60L; // 15 minutes
            case VERIFICATION_TOKEN -> 24 * 60 * 60L; // 24 hours
            case USER_VERSION, WISHLIST -> 7 * 24 * 60 * 60L; // 7 days
            case RESET_PASSWORD_OTP -> 5 * 60L; // 5 minutes
            case VERIFICATION_OTP -> 12 * 60 * 60L; // 12 hours
            case USER_CLICK -> 60L; // 1 minute
            case PROMOTION_EVENT -> 2 * 60 * 60L; // 2 hours
            case USER_CLAIMED_VOUCHER, WISHLIST_USER -> 3 * 24 * 60 * 60L; // 3 days
            case VOUCHER, STOCK, CLAIMED, LIMIT -> 24 * 60 * 60L; // 1 day
        };
    }

}
