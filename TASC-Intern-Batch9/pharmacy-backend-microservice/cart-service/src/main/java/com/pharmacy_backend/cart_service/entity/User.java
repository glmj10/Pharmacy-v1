package com.pharmacy_backend.cart_service.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@NoArgsConstructor
@Getter
@Setter
@Table(name = "users")
public class User{
    @Id
    private Long id;
    private String email;

    @OneToOne
    private Cart cart;

    public User(Long userId, String email) {
        this.id = userId;
        this.email = email;
    }
}
