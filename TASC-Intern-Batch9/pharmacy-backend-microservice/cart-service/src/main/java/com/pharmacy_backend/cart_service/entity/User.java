package com.pharmacy_backend.cart_service.entity;

import com.pharmacy_backend.common.entity.base.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Table(name = "users")
public class User extends BaseEntity {
    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

}
