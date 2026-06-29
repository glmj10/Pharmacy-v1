package com.pharmacy_backend.order_service.entity;


import com.pharmacy_backend.common.entity.base.BaseEntity;
import com.pharmacy_backend.common.enums.OrderStatusEnum;
import com.pharmacy_backend.common.enums.PaymentMethodEnum;
import com.pharmacy_backend.common.enums.PaymentStatusEnum;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "orders")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Order  extends BaseEntity {
    @Column(name = "customer_name")
    String customerName;
    @Column(name = "customer_phone_number")
    String customerPhoneNumber;

    @Column(name = "customer_address")
    String customerAddress;

    @Column(name = "subtotal_price")
    Long subtotalPrice;

    @Column(name = "shipping_fee")
    Long shippingFee;

    @Column(name = "total_price")
    Long totalPrice;

    @Column(name = "voucher_discount_price")
    Long voucherDiscountPrice;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    PaymentMethodEnum paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    PaymentStatusEnum paymentStatus;

    String note;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status")
    OrderStatusEnum status;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "order")
    List<OrderDetail> orderDetails = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    User user;

    @Column(name = "voucher_id")
    Long voucherId;

    @Column(name = "voucher_code")
    String voucherCode;
}
