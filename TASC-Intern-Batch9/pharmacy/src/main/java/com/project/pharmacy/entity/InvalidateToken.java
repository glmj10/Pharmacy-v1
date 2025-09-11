package com.project.pharmacy.entity;

import com.project.pharmacy.entity.base.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "invalidate_tokens")
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InvalidateToken extends BaseEntity {
    String token;
    LocalDateTime expiryTime;
}
