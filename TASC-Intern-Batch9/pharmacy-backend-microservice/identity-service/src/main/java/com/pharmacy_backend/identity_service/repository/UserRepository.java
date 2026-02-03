package com.pharmacy_backend.identity_service.repository;

import com.pharmacy_backend.identity_service.dto.request.UserSearchCriteria;
import com.pharmacy_backend.identity_service.entity.User;
import jakarta.validation.constraints.NotNull;
import lombok.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    Optional<User> findById(Long id);

    @Query(value = """
    SELECT DISTINCT u.*
    FROM users u
    JOIN user_roles ur on u.id = ur.user_id
    JOIN roles r on ur.role_id = r.id
    WHERE (:#{#req.email} IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', :#{#req.email}, '%')))
      AND (:#{#req.roleCode} IS NULL OR r.code = :#{#req.roleCode})
    """, countQuery = """
    SELECT COUNT(*)
    FROM users u
    JOIN user_roles ur on u.id = ur.user_id
    JOIN roles r on ur.role_id = r.id
    WHERE (:#{#req.email} IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', :#{#req.email}, '%')))
      AND (:#{#req.roleCode} IS NULL OR UPPER(r.code) = UPPER(:#{#req.roleCode}))
    """, nativeQuery = true)
    Page<User> searchUsers(@Param("req") UserSearchCriteria criteria, Pageable pageable);

}
