package com.project.pharmacy.repository;

import com.project.pharmacy.dto.request.UserSearchCriteria;
import com.project.pharmacy.entity.Role;
import com.project.pharmacy.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findById(Long id);
    @Query(value = """
    SELECT u.*
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
