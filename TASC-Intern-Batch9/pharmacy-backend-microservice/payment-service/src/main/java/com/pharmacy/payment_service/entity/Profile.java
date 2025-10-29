package com.pharmacy.payment_service.entity;


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
@Builder
public class Profile {
    @Id
    Long id;
    Long user_id;
    @Column(name = "phone_number")
    String phoneNumber;
    String address;

    @Column(name = "full_name")
    String fullName;
}
