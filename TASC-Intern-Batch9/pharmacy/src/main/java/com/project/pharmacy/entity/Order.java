package com.project.pharmacy.entity;


import com.project.pharmacy.entity.base.BaseEntity;
import com.project.pharmacy.enums.OrderStatusEnum;
import com.project.pharmacy.enums.PaymentMethodEnum;
import com.project.pharmacy.enums.PaymentStatusEnum;
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

    Long totalPrice;

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
    @JoinColumn(name = "cart_id", referencedColumnName = "id")
    Cart cart;
}
