package com.project.pharmacy.entity;


import com.project.pharmacy.entity.base.BaseEntity;
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
    String phone;
    String address;

    @Column(name = "full_name")
    String fullName;

    @ManyToOne
    @JoinColumn(name = "user_id")
    User user;
}
