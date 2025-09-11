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
@Table(name = "brands")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Brand extends BaseEntity {
    @Column(unique = true)
    String name;
    String description;

    @Column(unique = true)
    String slug;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "brand")
    List<Product> products = new ArrayList<>();
}
