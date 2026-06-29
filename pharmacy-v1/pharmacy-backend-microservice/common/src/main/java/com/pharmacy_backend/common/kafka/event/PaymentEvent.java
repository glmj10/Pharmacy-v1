package com.pharmacy_backend.common.kafka.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentEvent {
    private Long orderId;
    private String paymentStatus;

    public PaymentEvent(Long orderId) {
        this.orderId = orderId;
    }
}
