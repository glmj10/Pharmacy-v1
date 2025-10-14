package com.pharmacy_backend.cart_service.entity;

import com.pharmacy_backend.common.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "carts")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Cart extends BaseEntity {
    @OneToOne
    User user;

    @Column(name = "total_price")
    long totalPrice = 0L;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "cart")
    List<CartItem> cartItems = new ArrayList<>();
}
