package com.pharmacy_backend.product_service.entity;

import com.pharmacy_backend.common.kafka.event.UserEvent;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Set;

@Entity
@NoArgsConstructor
@Getter
@Setter
@Table(name = "users")
@AllArgsConstructor
public class User {
    @Id
    private Long id;
    private String email;

    @Column(name = "username")
    private String username;
    private String profilePicUrl;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Comment> comments;

    public User(UserEvent userEvent) {
        this.id = userEvent.getUserId();
        this.email = userEvent.getEmail();
        this.username = userEvent.getUsername();
        this.profilePicUrl = userEvent.getProfilePicUrl();
    }
}
