package com.project.pharmacy.repository;

import com.project.pharmacy.entity.InvalidatedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface InvalidatedTokenRepository extends JpaRepository<InvalidatedToken, String> {
    List<InvalidatedToken> findTop10ByExpiryTimeBefore(LocalDateTime expiryTime);

    // Idempotent insert (MySQL specific) to avoid duplicate key errors when the same token is invalidated concurrently.
    @Modifying(clearAutomatically = false, flushAutomatically = false)
    @Query(value = "INSERT IGNORE INTO invalidate_tokens(id, expiry_time) VALUES(:id, :expiryTime)", nativeQuery = true)
    int insertIgnore(@Param("id") String id, @Param("expiryTime") LocalDateTime expiryTime);
}
