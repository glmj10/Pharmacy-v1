package com.project.pharmacy.repository;

import com.project.pharmacy.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    List<PasswordResetToken> findTop10ByExpiryAtBefore(LocalDateTime expiryAtBefore);
}
