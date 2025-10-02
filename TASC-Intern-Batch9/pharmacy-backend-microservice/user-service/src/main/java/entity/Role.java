package com.project.pharmacy.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.GrantedAuthority;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "roles")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Role implements GrantedAuthority {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    String code;
    String name;

    @Column(columnDefinition = "TEXT")
    String description;

    @ManyToMany(fetch = FetchType.LAZY, mappedBy = "roles")
    List<User> userList;

    @Override
    public String getAuthority() {
        return code;
    }
}
