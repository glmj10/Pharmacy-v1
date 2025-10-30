package com.pharmacy_backend.common.dto.request;


import com.pharmacy_backend.common.enums.PaymentMethodEnum;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class PaymentRequest {
    Long orderId;
    PaymentMethodEnum paymentMethodEnum;
    Long totalPrice;
}
