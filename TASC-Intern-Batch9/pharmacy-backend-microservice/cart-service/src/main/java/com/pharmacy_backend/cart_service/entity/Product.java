package com.pharmacy_backend.cart_service.entity;

import com.pharmacy_backend.common.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "products")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Product{
    @Id
    Long id;
    String title;
    String slug;
    @Column(name = "price_new")
    Integer priceNew;
    @Column(name = "price_old")
    Integer priceOld;
    String thumbnailUrl;
    Boolean active;
    Integer quantity;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    List<CartItem> cartItems = new ArrayList<>();
}
