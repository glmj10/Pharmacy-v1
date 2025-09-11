package com.project.pharmacy.entity;

import com.project.pharmacy.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "customer_cares")
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomerCare extends BaseEntity {
    String email;
    String address;
    Boolean active = false;

    @Column(columnDefinition = "TEXT")
    String content;

    @Column(name = "full_name")
    String fullName;

    @Column(name = "phone_number")
    String phoneNumber;
}
