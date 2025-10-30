package com.pharmacy.payment_service.repository;

import com.pharmacy.payment_service.entity.OutboxEvent;
import com.pharmacy_backend.common.enums.EventStatusEnum;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OutboxEventRepository extends JpaRepository<OutboxEvent, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM OutboxEvent e WHERE e.eventStatus = :status order by e.createdAt asc limit 100")
    List<OutboxEvent> findPendingEvents(@Param("status") EventStatusEnum status);
}
