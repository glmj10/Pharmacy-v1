package com.pharmacy_backend.order_service.entity;

import com.pharmacy_backend.common.entity.base.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Table(name = "user_vouchers", uniqueConstraints =
        {
                @UniqueConstraint(columnNames = {"user_id", "voucher_id"})
        }
)
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class UserVoucher extends BaseEntity {
    @Column(name = "user_id")
    Long userId;

    @Column(name = "voucher_id")
    Long voucherId;

    Integer quantity = 1;

    @Column(name = "is_used")
    Boolean isUsed = false;

    @CreationTimestamp
    @Column(name = "obtained_at")
    LocalDateTime obtainedAt;
}
