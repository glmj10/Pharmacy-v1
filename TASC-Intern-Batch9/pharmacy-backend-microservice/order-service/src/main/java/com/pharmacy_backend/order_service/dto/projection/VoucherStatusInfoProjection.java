package com.pharmacy_backend.order_service.dto.projection;

public interface VoucherStatusProjection {
    Long getVoucherId();
    Boolean getUsed();
}
