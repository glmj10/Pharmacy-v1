package com.pharmacy_backend.product_service.entity;

import com.pharmacy_backend.common.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

//Nhóm bệnh
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Table(name = "diseases")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Disease extends BaseEntity {
    String code;
    String name;
    String description;

    @ManyToMany
    @JoinTable(name = "diseases_symptoms", joinColumns = @JoinColumn(name = "disease_id"),
            inverseJoinColumns = @JoinColumn(name = "symptom_id"))
    List<Symptom> symptoms;

    @ManyToMany
    @JoinTable(name = "diseases_products", joinColumns = @JoinColumn(name = "disease_id"),
            inverseJoinColumns = @JoinColumn(name = "product_id"))
    List<Product> products;
}
