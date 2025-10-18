package com.pharmacy_backend.category_service.repository;

import com.pharmacy_backend.category_service.entity.Type;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TypeRepository extends JpaRepository<Type, Long> {
    Optional<Type> findByCode(String code);
}
