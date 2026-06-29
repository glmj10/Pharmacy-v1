package com.pharmacy_backend.common.enums;

import lombok.Getter;

@Getter
public enum PartitionKeyEnum {
    USER, PROFILE, CATEGORY, PRODUCT, ORDER, PAYMENT,PROMOTION, VOUCHER, FILE;

    public String getName() {
        return this.name();
    }
}
