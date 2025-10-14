package com.pharmacy_backend.identity_service.repository;

import com.pharmacy_backend.identity_service.entity.OutboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OutboxRepository extends JpaRepository<OutboxEvent, Long> {
}
