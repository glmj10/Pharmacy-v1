package com.pharmacy_backend.order_service.dto.response;

import jakarta.persistence.Column;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderResponse {
    Long id;
    Long totalPrice;
    Long voucherDiscountPrice;
    Long subtotalPrice;
    Long shippingFee;
    String note;
    String customerName;
    String customerPhoneNumber;
    String customerAddress;
    String status;
    String paymentMethod;
    String paymentStatus;
    Long voucherId;
    String voucherCode;
    LocalDateTime createdAt;
}
