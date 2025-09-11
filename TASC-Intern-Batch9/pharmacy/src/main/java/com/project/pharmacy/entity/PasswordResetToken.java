package com.project.pharmacy.entity;

import com.project.pharmacy.entity.base.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PasswordResetToken extends BaseEntity {
    String token;
    LocalDateTime expiryAt;
    Boolean used = false;
}
