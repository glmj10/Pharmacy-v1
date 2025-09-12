package com.project.pharmacy.entity;


import com.project.pharmacy.entity.base.BaseEntity;
import com.project.pharmacy.enums.OrderStatusEnum;
import com.project.pharmacy.enums.PaymentMethodEnum;
import com.project.pharmacy.enums.PaymentStatusEnum;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

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

    Double totalPrice;

    @Column(name = "payment_method")
    PaymentMethodEnum paymentMethod;

    @Column(name = "payment_status")
    PaymentStatusEnum paymentStatus;

    String note;

    @Column(name = "order_status")
    OrderStatusEnum status;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "order")
    List<OrderDetail> orderDetails;

    @ManyToOne
    @JoinColumn(name = "cart_id", referencedColumnName = "id")
    Cart cart;

    @ManyToOne
    @JoinColumn(name = "profile_id")
    Profile profile;
}
