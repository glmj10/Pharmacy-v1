package com.project.pharmacy.entity;

import com.project.pharmacy.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.*;

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
    Integer tokenVersion = 0;

    @Column(name = "is_active_email")
    Boolean isActiveEmail = false;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "user")
    List<Profile> profileList;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    Set<Role> roles = new HashSet<>();

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "user")
    List<VerificationToken> verificationTokens = new ArrayList<>();

    public void setStatusEmail(Boolean statusEmail) {
        isActiveEmail = statusEmail;
    }

    public boolean isVerified() {
        return isActiveEmail;
    }
}
