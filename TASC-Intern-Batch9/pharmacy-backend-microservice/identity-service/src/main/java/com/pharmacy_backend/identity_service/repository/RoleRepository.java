package com.pharmacy_backend.identity_service.repository;



import com.pharmacy_backend.identity_service.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByCode(String code);
    boolean existsByName(String name);
    List<Role> findByCodeIn(Set<String> roles);

    boolean existsByCode(String code);

    List<Role> findByCodeContainingIgnoreCase(String code);

    List<Role> findByNameContainingIgnoreCase(String name);
}
