package com.pharmacy_backend.user_service.entity;

import com.pharmacy_backend.common.entity.base.BaseOutBoxEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "outbox_events")
public class OutboxEvent extends BaseOutBoxEntity {
}
