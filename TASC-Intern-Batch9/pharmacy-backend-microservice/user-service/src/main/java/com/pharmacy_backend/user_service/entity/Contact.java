package com.pharmacy_backend.user_service.entity;

import com.pharmacy_backend.common.entity.base.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "contacts")
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Contact extends BaseEntity {
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
