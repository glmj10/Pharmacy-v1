package com.pharmacy_backend.order_service.entity;

import com.pharmacy_backend.common.entity.base.BaseModifyEntity;
import com.pharmacy_backend.common.enums.DiscountTypeEnum;
import com.pharmacy_backend.common.enums.VoucherStatusEnum;
import com.pharmacy_backend.common.enums.VoucherTypeEnum;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "vouchers")
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Voucher extends BaseModifyEntity {
    String name;
    String code;
    String description;

    @Enumerated(EnumType.STRING)
    VoucherTypeEnum type;

    @Enumerated(EnumType.STRING)
    DiscountTypeEnum discountType;

    @Column(name = "discount_value")
    Integer discountValue;

    @Column(name = "max_discount_amount")
    Integer maxDiscountAmount;

    @Column(name = "min_order_value")
    Integer minOrderValue;

    @Column(name = "usage_limit")
    Integer usageLimit;

    @Column(name = "collected_count")
    Integer collectedCount = 0;

    @Column(name = "usage_limit_per_user")
    Integer usageLimitPerUser;

    @Enumerated(EnumType.STRING)
    VoucherStatusEnum status = VoucherStatusEnum.INACTIVE;

    @Column(name = "start_date")
    LocalDateTime startDate;

    @Column(name = "end_date")
    LocalDateTime endDate;
}
