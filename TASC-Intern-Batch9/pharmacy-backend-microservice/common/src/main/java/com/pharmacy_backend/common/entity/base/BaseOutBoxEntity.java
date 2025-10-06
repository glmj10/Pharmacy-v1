package com.pharmacy_backend.common.entity.base;

import com.pharmacy_backend.common.enums.EventStatusEnum;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
@MappedSuperclass
public class BaseOutBoxEntity {
    @Id
    @GeneratedValue
    UUID id;
    @Column(name = "aggregate_id", nullable = false)
    Long aggregateId;

    @Column(name = "aggregate_type", nullable = false)
    String aggregateType;

    @Column(name = "event_type", nullable = false)
    String eventType;

    @Column(name = "event_version", nullable = false)
    Long eventVersion = 1L;

    @Column(name = "payload", columnDefinition = "TEXT", nullable = false)
    String payload;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_status", nullable = false)
    EventStatusEnum eventStatus = EventStatusEnum.PENDING;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @Column(name = "processed_at")
    LocalDateTime processedAt;
}
