package com.pharmacy_backend.order_service.entity;


import com.pharmacy_backend.common.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "order_details")
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class OrderDetail extends BaseEntity {
    @Column(name = "price_at_order")
    Integer priceAtOrder;

    @Column(name = "cost_price_at_order")
    Integer costPriceAtOrder;

    Integer quantity;

    @ManyToOne
    @JoinColumn(name = "order_id")
    Order order;

    @ManyToOne
    @JoinColumn(name = "product_id")
    Product product;

    boolean isRated = false;
}
