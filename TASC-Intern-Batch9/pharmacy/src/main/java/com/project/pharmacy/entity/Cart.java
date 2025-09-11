package com.project.pharmacy.entity;

import com.project.pharmacy.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "carts")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Cart extends BaseEntity {
    @OneToOne
    User user;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "cart")
    List<CartItem> cartItems = new ArrayList<>();
}
