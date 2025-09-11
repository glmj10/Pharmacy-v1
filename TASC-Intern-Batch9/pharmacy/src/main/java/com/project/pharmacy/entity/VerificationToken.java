package com.project.pharmacy.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "verification_tokens")
@NoArgsConstructor
@AllArgsConstructor
public class VerificationToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true, columnDefinition = "TEXT")
    private String token;

    boolean used = false;

    public void changeTokenStatus(boolean status) {
        this.used = true;
    }

    public boolean isTokenUsed() {
        return this.used;
    }

    @Column(nullable = false, name = "expiry_at")
    LocalDateTime expiryAt;
}
