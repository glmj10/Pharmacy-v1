package com.project.pharmacy.entity;

import com.project.pharmacy.entity.base.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Getter
@Setter
@Table(name = "types")
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Type extends BaseEntity {
    @Column(nullable = false)
    String code;
    String name;
    String description;
}
