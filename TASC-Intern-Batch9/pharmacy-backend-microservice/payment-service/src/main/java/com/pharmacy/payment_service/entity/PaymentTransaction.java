package com.pharmacy.payment_service.entity;

import com.pharmacy_backend.common.entity.base.BaseEntity;
import com.pharmacy_backend.common.enums.PaymentMethodEnum;
import com.pharmacy_backend.common.enums.PaymentStatusEnum;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "payment_transactions")
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentTransaction extends BaseEntity {
    @Column(name = "transaction_id", nullable = false)
    String transactionId;
    @Column(name = "order_id", nullable = false)
    Long orderId;
    Long amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    PaymentStatusEnum paymentStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    PaymentMethodEnum paymentMethod;

    @Column(name = "transaction_date", nullable = false)
    LocalDateTime transactionDate;

    @Column(name = "response_code", nullable = false)
    String responseCode;

}
