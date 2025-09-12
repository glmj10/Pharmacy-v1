package com.project.pharmacy.repository;

import com.project.pharmacy.entity.PasswordResetToken;
import jakarta.validation.constraints.NotEmpty;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    List<PasswordResetToken> findTop10ByExpiryAtBefore(LocalDateTime expiryAtBefore);

    Optional<PasswordResetToken> findByToken(String resetToken);
}
