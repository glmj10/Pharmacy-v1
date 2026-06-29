package com.pharmacy_backend.product_service.entity;

import com.pharmacy_backend.common.entity.base.BaseOutBoxEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "outbox_events")
public class OutboxEvent extends BaseOutBoxEntity {
}
