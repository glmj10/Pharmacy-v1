package com.pharmacy_backend.order_service.entity;

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
public class Product {
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
}
