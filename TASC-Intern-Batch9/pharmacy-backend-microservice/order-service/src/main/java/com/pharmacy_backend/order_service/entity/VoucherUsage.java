package com.pharmacy_backend.order_service.entity;

import com.pharmacy_backend.common.entity.base.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "voucher_usages")
@Getter
@Setter
public class VoucherUsage extends BaseEntity {
    @Column(name = "voucher_id")
    Long voucherId;

    @Column(name = "user_id")
    Long userId;

    @Column(name = "order_id")
    Long orderId;

    @Column(name = "used_at")
    LocalDateTime usedAt;

    @Column(name = "discount_amount")
    Long discountAmount;
}
