package com.pharmacy_backend.order_service.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@NoArgsConstructor
@Getter
@Setter
@Table(name = "users")
public class User {
    @Id
    private Long id;
    private String email;

    public User(Long userId, String email) {
        this.id = userId;
        this.email = email;
    }
}
