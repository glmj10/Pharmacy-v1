package com.project.pharmacy.entity;


import com.project.pharmacy.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "cart_items")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CartItem extends BaseEntity {
    Integer quantity;
    Boolean selected = false;

    @Column(name = "price_at_addition")
    Long priceAtAddition;

    @OneToOne
    Product product;

    @ManyToOne
    @JoinColumn(name = "cart_id")
    Cart cart;
}
