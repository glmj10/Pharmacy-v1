package com.project.pharmacy.repository;

import com.project.pharmacy.entity.InvalidatedToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

public interface InvalidatedTokenRepository extends JpaRepository<InvalidatedToken, String> {
    List<InvalidatedToken> findTop10ByExpiryTimeBefore(LocalDateTime expiryTime);
}
