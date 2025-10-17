package com.pharmacy_backend.cart_service.entity;

import com.pharmacy_backend.common.entity.base.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.FieldDefaults;


@Entity
@Table(name = "products")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Product extends BaseEntity {
    @Column(name = "product_id", nullable = false, unique = true)
    Long productId;
    String title;
    Long quantity;

    @Column(name = "price_new")
    Integer priceNew;
    @Column(name = "price_old")
    Integer priceOld;
}
