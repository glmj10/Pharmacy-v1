package com.pharmacy_backend.user_service.entity;


import com.pharmacy_backend.common.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Getter
@Setter
@Table(name = "profiles")
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Profile extends BaseEntity {

    @Column(name = "phone_number")
    String phoneNumber;
    String address;

    @Column(name = "full_name")
    String fullName;

    @ManyToOne
    @JoinColumn(name = "user_id")
    User user;
}
