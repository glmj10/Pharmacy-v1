package com.pharmacy_backend.product_service.entity;


// Triệu chứng bệnh

import com.pharmacy_backend.common.entity.base.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "symptoms")
public class Symptom extends BaseEntity {
    String name;
    String slang;
    String description;

    @ManyToMany
    List<Disease> diseases;
}
