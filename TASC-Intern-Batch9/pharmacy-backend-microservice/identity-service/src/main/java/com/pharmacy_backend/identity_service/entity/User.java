package com.pharmacy_backend.identity_service.entity;

import com.pharmacy_backend.common.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class User extends BaseEntity {
    @Column(nullable = false)
    String email;

    @Column(nullable = false)
    String username;

    @Column(nullable = false)
    String password;

    @Column(name = "token_version")
    int tokenVersion;

    @Column(name = "is_active_email")
    boolean isActiveEmail = false;

    @Column(name = "profile_pic")
    String profilePic;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    Set<Role> roles = new HashSet<>();

    public void setStatusEmail(boolean statusEmail) {
        isActiveEmail = statusEmail;
    }

    public boolean isVerified() {
        return isActiveEmail;
    }
}
